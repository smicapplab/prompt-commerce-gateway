// ─── Payment Service ──────────────────────────────────────────────────────────
// Resolves the correct gateway adapter per store and manages Payment DB records.

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { PRISMA } from '../prisma/prisma.module';
import { MockGateway } from './adapters/mock.gateway';
import { PayMongoGateway } from './adapters/paymongo.gateway';
import { StripeGateway } from './adapters/stripe.gateway';
import {
  OrderContext,
  PaymentGateway,
  PaymentStatus,
  WebhookEvent,
} from './payment-gateway.interface';

export interface InitiatePaymentInput {
  orderId:      number;
  storeSlug:    string;
  buyerRef:     string;   // Telegram userId as string
  amount:       number;
  currency:     string;
  description:  string;
  buyerEmail?:  string;
  // These are assembled by the service from env / request:
  baseUrl:      string;   // e.g. https://gateway.example.com  (no trailing slash)
}

export interface PaymentRecord {
  id:          number;
  referenceId: string;
  status:      string;
  paymentUrl:  string | null;
  provider:    string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  private readonly adapters: Map<string, PaymentGateway>;

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly mockGateway: MockGateway,
    private readonly payMongoGateway: PayMongoGateway,
    private readonly stripeGateway: StripeGateway,
  ) {
    this.adapters = new Map<string, PaymentGateway>([
      ['mock',      mockGateway],
      ['paymongo',  payMongoGateway],
      ['stripe',    stripeGateway],
    ]);
  }

  // ── Resolve adapter ────────────────────────────────────────────────────────

  private resolveAdapter(provider: string | null | undefined): PaymentGateway {
    const key = (provider ?? 'mock').toLowerCase();
    const adapter = this.adapters.get(key);
    if (!adapter) {
      this.logger.warn(`Unknown payment provider "${key}", falling back to mock`);
      return this.mockGateway;
    }
    return adapter;
  }

  // ── Initiate payment ───────────────────────────────────────────────────────

  // After running the migration + `prisma generate`, these casts can be removed.


  async initiatePayment(input: InitiatePaymentInput): Promise<PaymentRecord> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { slug: input.storeSlug },
    });
    if (!retailer) throw new NotFoundException(`Store "${input.storeSlug}" not found`);

    const adapter = this.resolveAdapter(retailer.paymentProvider);
    const provider = adapter.name;

    const orderCtx: OrderContext = {
      orderId:    input.orderId,
      storeSlug:  input.storeSlug,
      amount:     input.amount,
      currency:   input.currency || 'PHP',
      description: input.description,
      buyerEmail: input.buyerEmail,
      webhookUrl: `${input.baseUrl}/webhooks/payment/${input.storeSlug}`,
      successUrl: `${input.baseUrl}/payment/success?store=${input.storeSlug}&order=${input.orderId}`,
      cancelUrl:  `${input.baseUrl}/payment/cancel?store=${input.storeSlug}&order=${input.orderId}`,
      apiKey:     retailer.paymentApiKey ?? undefined,
    };

    this.logger.log(`Initiating ${provider} payment for order ${input.orderId} (${input.storeSlug})`);

    const result = await adapter.initiatePayment(orderCtx);

    // Persist the payment record
    const payment = await this.prisma.payment.create({
      data: {
        referenceId: result.referenceId,
        storeSlug:   input.storeSlug,
        orderId:     input.orderId,
        buyerRef:    input.buyerRef,
        amount:      input.amount,
        currency:    input.currency || 'PHP',
        provider,
        status:      result.status,
        paymentUrl:  result.paymentUrl ?? null,
      },
    });

    return {
      id:          payment.id,
      referenceId: payment.referenceId,
      status:      payment.status,
      paymentUrl:  payment.paymentUrl,
      provider:    payment.provider,
    };
  }

  // ── Handle incoming webhook ────────────────────────────────────────────────

  async handleWebhook(
    storeSlug: string,
    body:      unknown,
    signature: string,
  ): Promise<WebhookEvent | null> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { slug: storeSlug },
    });
    if (!retailer) return null;

    const adapter = this.resolveAdapter(retailer.paymentProvider);
    const secret  = retailer.paymentWebhookSecret ?? '';

    const event = await adapter.handleWebhook(body, signature, secret);
    if (!event) return null;

    // Update the Payment record's status
    try {
      await this.prisma.payment.update({
        where: { referenceId: event.referenceId },
        data:  { status: event.status },
      });
    } catch (err) {
      this.logger.error(
        `Failed to update payment ${event.referenceId}: ${(err as Error).message}`,
      );
    }

    return event;
  }

  // ── Lookup ─────────────────────────────────────────────────────────────────

  async findByReference(referenceId: string) {
    return this.prisma.payment.findUnique({ where: { referenceId } });
  }

  async findByOrder(storeSlug: string, orderId: number) {
    return this.prisma.payment.findFirst({
      where: { storeSlug, orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Update payment config on a store ──────────────────────────────────────

  async updatePaymentConfig(
    storeSlug: string,
    config: {
      paymentProvider?:      string | null;
      paymentApiKey?:        string | null;
      paymentPublicKey?:     string | null;
      paymentWebhookSecret?: string | null;
    },
  ) {
    await this.prisma.retailer.update({
      where: { slug: storeSlug },
      data:  config,
    });
  }

  // ── Get payment config status (public key only — never expose secret key) ─

  async getPaymentConfigStatus(storeSlug: string) {
    const retailer = await this.prisma.retailer.findUnique({
      where:  { slug: storeSlug },
    });
    return {
      provider:      retailer?.paymentProvider  ?? 'mock',
      hasApiKey:     !!retailer?.paymentApiKey,
      hasPublicKey:  !!retailer?.paymentPublicKey,
      publicKey:     retailer?.paymentPublicKey  ?? null,
    };
  }
}
