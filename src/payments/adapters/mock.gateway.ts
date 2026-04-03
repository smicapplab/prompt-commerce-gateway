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

    return {
      referenceId,
      status: 'paid', // Confirm instantly - no redirect needed
    };
  }

  // Mock exercises the same webhook verification path as real providers
  async handleWebhook(
    body: any,
    signature: string,
    secret: string,
  ): Promise<WebhookEvent | null> {
    // Basic signature verification (mock-secret)
    if (signature !== secret) return null;

    // Expected mock payload: { type: 'mock.payment.paid', referenceId: '...' }
    if (body?.type === 'mock.payment.paid' && body?.referenceId) {
      return {
        referenceId: body.referenceId,
        status:      'paid',
      };
    }

    return null;
  }
}
