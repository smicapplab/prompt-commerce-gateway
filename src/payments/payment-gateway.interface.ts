// ─── Payment Gateway Interface ────────────────────────────────────────────────
// All payment adapters (Mock, PayMongo, Stripe, …) implement this interface.
// PaymentService resolves the right adapter per store based on the Retailer row.

export interface OrderContext {
  orderId:     number;
  storeSlug:   string;
  amount:      number;   // total in major currency units (e.g. 1500.00)
  currency:    string;   // ISO 4217 (e.g. "PHP")
  description: string;   // shown on payment page
  buyerEmail?: string;
  webhookUrl:  string;   // gateway endpoint that receives provider callbacks
  successUrl:  string;   // redirect after successful payment (for hosted pages)
  cancelUrl:   string;   // redirect on cancel
  apiKey?:     string;   // secret key for the provider (injected by PaymentService)
  paymentLinkTemplate?: string; // for Assisted Payments (e.g. "https://pay.me/{{orderId}}")
}

export interface PaymentResult {
  referenceId: string;          // provider's transaction / payment-intent ID
  status:      'pending' | 'paid';
  paymentUrl?: string;          // present for real gateways; absent for mock
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface WebhookEvent {
  referenceId: string;
  status:      PaymentStatus;
}

export interface PaymentGateway {
  readonly name: string;  // 'mock' | 'paymongo' | 'stripe'

  initiatePayment(order: OrderContext): Promise<PaymentResult>;

  /** Called by WebhookController; returns null if signature is invalid. */
  handleWebhook(
    body:      unknown,
    signature: string,
    secret:    string,
  ): Promise<WebhookEvent | null>;
}
