// ─── Cash on Delivery (COD) Gateway ───────────────────────────────────────────
// Minimal adapter for orders that will be paid in cash upon delivery/pickup.
// Always returns status 'pending' and requires manual seller confirmation.

import { Injectable } from '@nestjs/common';
import {
  OrderContext,
  PaymentGateway,
  PaymentResult,
  WebhookEvent,
} from '../payment-gateway.interface';

@Injectable()
export class CodGateway implements PaymentGateway {
  readonly name = 'cod';

  async initiatePayment(order: OrderContext): Promise<PaymentResult> {
    // Generate a reference ID for traceability
    const referenceId = `cod_${order.storeSlug}_${order.orderId}_${Date.now()}`;

    // COD never has a redirect URL; the buyer just sees a confirmation message
    return {
      referenceId,
      status: 'pending',
    };
  }

  /** COD does not use webhooks. */
  async handleWebhook(): Promise<WebhookEvent | null> {
    return null;
  }
}
