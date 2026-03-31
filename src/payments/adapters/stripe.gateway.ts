// ─── Stripe Payment Gateway ───────────────────────────────────────────────────
// Uses Stripe Checkout Sessions (hosted payment page).
// Docs: https://stripe.com/docs/api/checkout/sessions
//
// Flow:
//   1. initiatePayment() → creates a Checkout Session → returns session.url
//   2. Stripe POSTs to webhookUrl on checkout.session.completed / payment_intent.payment_failed
//   3. handleWebhook() verifies Stripe-Signature header → returns WebhookEvent

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  OrderContext,
  PaymentGateway,
  PaymentResult,
  PaymentStatus,
  WebhookEvent,
} from '../payment-gateway.interface';

const STRIPE_API = 'https://api.stripe.com/v1';

@Injectable()
export class StripeGateway implements PaymentGateway {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeGateway.name);

  async initiatePayment(order: OrderContext): Promise<PaymentResult> {
    // Stripe amounts are in minor units (centavos / cents)
    const amountMinor = Math.round(order.amount * 100);

    // Stripe uses form-encoded bodies
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', order.successUrl);
    params.append('cancel_url', order.cancelUrl);
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', order.currency.toLowerCase());
    params.append('line_items[0][price_data][unit_amount]', String(amountMinor));
    params.append('line_items[0][price_data][product_data][name]', order.description);
    params.append('metadata[order_id]', String(order.orderId));
    params.append('metadata[store_slug]', order.storeSlug);
    if (order.buyerEmail) {
      params.append('customer_email', order.buyerEmail);
    }

    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${order.apiKey}`,
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Stripe initiatePayment failed: ${res.status} ${err}`);
      throw new Error(`Stripe error: ${res.status}`);
    }

    const session = await res.json() as any;

    return {
      referenceId: session.id as string,
      status: 'pending',
      paymentUrl: session.url as string,
    };
  }

  handleWebhook(
    body: unknown,
    signature: string,
    secret: string,
  ): Promise<WebhookEvent | null> {
    // Stripe signs with HMAC-SHA256; header format: "t=<ts>,v1=<sig>,v0=<sig>"
    try {
      const rawBody = typeof body === 'string' ? body : JSON.stringify(body);

      // Parse header
      const parts: Record<string, string[]> = {};
      for (const part of signature.split(',')) {
        const eqIdx = part.indexOf('=');
        if (eqIdx === -1) continue;
        const k = part.substring(0, eqIdx);
        const v = part.substring(eqIdx + 1);
        if (!parts[k]) parts[k] = [];
        parts[k].push(v);
      }

      const timestamp = parts['t']?.[0];
      const v1Sigs = parts['v1'] ?? [];
      if (!timestamp || v1Sigs.length === 0) return Promise.resolve(null);

      // Webhook Replay Attack Protection: Check timestamp tolerance (5 mins)
      const ts = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - ts) > 300) {
        this.logger.warn(`Stripe webhook timestamp out of range: ${ts} (now: ${now})`);
        return Promise.resolve(null);
      }

      // Recompute expected signature
      const toSign = `${timestamp}.${rawBody}`;
      const expected = crypto
        .createHmac('sha256', secret)
        .update(toSign)
        .digest('hex');

      const valid = v1Sigs.some((sig) => {
        try {
          return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
        } catch {
          return false;
        }
      });

      if (!valid) {
        this.logger.warn('Stripe webhook signature mismatch');
        return Promise.resolve(null);
      }

      const event = body as any;
      const eventType: string = event?.type ?? '';
      const obj = event?.data?.object;
      const referenceId: string = obj?.id ?? '';

      let status: PaymentStatus;
      if (
        eventType === 'checkout.session.completed' &&
        obj?.payment_status === 'paid'
      ) {
        status = 'paid';
      } else if (
        eventType === 'payment_intent.payment_failed'
      ) {
        status = 'failed';
      } else {
        return Promise.resolve(null);
      }

      return Promise.resolve({ referenceId, status });
    } catch (err) {
      this.logger.error('Stripe handleWebhook error', err);
      return Promise.resolve(null);
    }
  }
}
