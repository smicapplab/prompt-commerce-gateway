// ─── PayMongo Payment Gateway ─────────────────────────────────────────────────
// PayMongo supports GCash, Maya, cards, and more (Philippines-focused).
// Docs: https://developers.paymongo.com/reference
//
// Flow:
//   1. initiatePayment() → creates a PaymentIntent + PaymentMethod Source
//      → returns a checkout_url for the buyer to complete payment
//   2. PayMongo POSTs to webhookUrl when payment is paid/failed
//   3. handleWebhook() verifies signature + returns WebhookEvent

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  OrderContext,
  PaymentGateway,
  PaymentResult,
  PaymentStatus,
  WebhookEvent,
} from '../payment-gateway.interface';

const PAYMONGO_API = 'https://api.paymongo.com/v1';

@Injectable()
export class PayMongoGateway implements PaymentGateway {
  readonly name = 'paymongo';
  private readonly logger = new Logger(PayMongoGateway.name);

  async initiatePayment(order: OrderContext): Promise<PaymentResult> {
    // PayMongo amounts are in centavos (minor currency units)
    const amountCentavos = Math.round(order.amount * 100);

    const body = {
      data: {
        attributes: {
          amount: amountCentavos,
          currency: order.currency,
          description: order.description,
          statement_descriptor: order.storeSlug.substring(0, 22),
          redirect: {
            success: order.successUrl,
            failed: order.cancelUrl,
          },
          // Accept all available payment methods for this merchant
          payment_method_allowed: [
            'card',
            'gcash',
            'maya',
            'dob',
            'dob_ubp',
            'brankas_bdo',
            'brankas_landbank',
            'brankas_metrobank',
          ],
          payment_method_options: {
            card: { request_three_d_secure: 'any' },
          },
          ...(order.buyerEmail ? { billing: { email: order.buyerEmail } } : {}),
        },
      },
    };

    const res = await fetch(`${PAYMONGO_API}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(order.apiKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`PayMongo initiatePayment failed: ${res.status} ${err}`);
      throw new Error(`PayMongo error: ${res.status}`);
    }

    const data = await res.json() as any;
    const link = data?.data;
    const referenceId: string = link?.id;
    const checkoutUrl: string = link?.attributes?.checkout_url;

    return {
      referenceId,
      status: 'pending',
      paymentUrl: checkoutUrl,
    };
  }

  handleWebhook(
    body: unknown,
    signature: string,
    secret: string,
  ): Promise<WebhookEvent | null> {
    // PayMongo signs with HMAC-SHA256; signature header is "paymongo-signature"
    // Format: "t=<timestamp>,te=<sig>,li=<sig>"
    try {
      const rawBody = typeof body === 'string' ? body : JSON.stringify(body);

      // Parse signature header
      const parts: Record<string, string> = {};
      for (const part of signature.split(',')) {
        const [k, v] = part.split('=');
        if (k && v) parts[k] = v;
      }
      const timestamp = parts['t'];
      const sig = parts['te'] ?? parts['li'];

      if (!timestamp || !sig) return Promise.resolve(null);

      // Webhook Replay Attack Protection: Check timestamp tolerance (5 mins)
      const ts = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - ts) > 300) {
        this.logger.warn(`PayMongo webhook timestamp out of range: ${ts} (now: ${now})`);
        return Promise.resolve(null);
      }

      // Recompute expected signature
      const toSign = `${timestamp}.${rawBody}`;
      const expected = crypto
        .createHmac('sha256', secret)
        .update(toSign)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        this.logger.warn('PayMongo webhook signature mismatch');
        return Promise.resolve(null);
      }

      const event = body as any;
      const eventType: string = event?.data?.attributes?.type ?? '';
      const resource = event?.data?.attributes?.data;
      
      // PayMongo Link reference handling (Finding #15)
      // link.payment.paid returns a payment resource, where link_id is the reference we stored.
      let referenceId: string = '';
      if (eventType.startsWith('link.')) {
        referenceId = resource?.attributes?.link_id ?? resource?.id ?? '';
      } else {
        referenceId = resource?.id ?? '';
      }

      let status: PaymentStatus;
      if (eventType.includes('paid') || eventType.includes('payment.paid')) {
        status = 'paid';
      } else if (eventType.includes('fail')) {
        status = 'failed';
      } else {
        // Unknown event type — ignore
        return Promise.resolve(null);
      }

      return Promise.resolve({ referenceId, status });
    } catch (err) {
      this.logger.error('PayMongo handleWebhook error', err);
      return Promise.resolve(null);
    }
  }
}
