// ─── Mock Payment Gateway ─────────────────────────────────────────────────────
// Confirms payments instantly without any external call.
// Used for local dev, demos, and as a template for real adapters.

import { Injectable } from '@nestjs/common';
import {
  OrderContext,
  PaymentGateway,
  PaymentResult,
  WebhookEvent,
} from '../payment-gateway.interface';

@Injectable()
export class MockGateway implements PaymentGateway {
  readonly name = 'mock';

  async initiatePayment(order: OrderContext): Promise<PaymentResult> {
    // Generate a deterministic reference ID for traceability
    const referenceId = `mock_${order.storeSlug}_${order.orderId}_${Date.now()}`;

    // Mock confirms instantly — no redirect needed
    return {
      referenceId,
      status: 'paid',
    };
  }

  // Mock never receives real webhooks; this is a no-op stub
  async handleWebhook(
    _body: unknown,
    _signature: string,
    _secret: string,
  ): Promise<WebhookEvent | null> {
    return null;
  }
}
