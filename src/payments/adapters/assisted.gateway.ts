// ─── Assisted Payment Gateway ────────────────────────────────────────────────
// Handles "offline" or out-of-band payments (bank transfer, manual GCash links).
// Generates a payment URL based on a template provided by the seller.

import { Injectable } from '@nestjs/common';
import {
  OrderContext,
  PaymentGateway,
  PaymentResult,
  WebhookEvent,
} from '../payment-gateway.interface';

@Injectable()
export class AssistedGateway implements PaymentGateway {
  readonly name = 'assisted';

  async initiatePayment(order: OrderContext): Promise<PaymentResult> {
    const referenceId = `ast_${order.storeSlug}_${order.orderId}_${Date.now()}`;

    let paymentUrl: string | undefined;
    if (order.paymentLinkTemplate) {
      paymentUrl = order.paymentLinkTemplate
        .replace(/{{orderId}}/g, String(order.orderId))
        .replace(/{{amount}}/g, String(order.amount))
        .replace(/{{currency}}/g, order.currency)
        .replace(/{{slug}}/g, order.storeSlug);
    }

    return {
      referenceId,
      status: 'pending',
      paymentUrl,
    };
  }

  /** Assisted payments do not use webhooks. */
  async handleWebhook(): Promise<WebhookEvent | null> {
    return null;
  }
}
