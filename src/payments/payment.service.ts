// ─── Payment Service ──────────────────────────────────────────────────────────
// Resolves the correct gateway adapter per store and manages Payment DB records.

import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { SettingsService } from '../settings/settings.service';
import { MockGateway } from './adapters/mock.gateway';
import { CodGateway } from './adapters/cod.gateway';
import { AssistedGateway } from './adapters/assisted.gateway';
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
  currency?:    string;
  description:  string;
  buyerEmail?:  string;
  // These are assembled by the service from env / request:
  baseUrl:      string;   // e.g. https://gateway.example.com  (no trailing slash)
  providerOverride?: string; // e.g. 'cod' when buyer explicitly chose COD
}

export interface PaymentRecord {
  id:          number;
  referenceId: string;
  status:      string;
  paymentUrl:  string | null;
  successUrl:  string | null;
  cancelUrl:   string | null;
  provider:    string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  private readonly adapters: Map<string, PaymentGateway>;

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly settings: SettingsService,
    private readonly mockGateway: MockGateway,
    private readonly codGateway: CodGateway,
    private readonly assistedGateway: AssistedGateway,
    private readonly payMongoGateway: PayMongoGateway,
    private readonly stripeGateway: StripeGateway,
  ) {
    this.adapters = new Map<string, PaymentGateway>([
      ['mock',      mockGateway],
      ['cod',       codGateway],
      ['assisted',  assistedGateway],
      ['paymongo',  payMongoGateway],
      ['stripe',    stripeGateway],
    ]);
  }

  // ── Resolve primary provider ──────────────────────────────────────────────

  private getPrimaryProvider(retailer: any): string {
    try {
      const methods = JSON.parse(retailer.paymentMethods || '[]');
      // Prefer the first non-COD method in the array as the "primary" (webhook target)
      const online = methods.filter((m: string) => m.toLowerCase() !== 'cod');
      if (online.length > 0) return online[0].toLowerCase();
    } catch (e) {
      this.logger.error(`Failed to parse paymentMethods for ${retailer.slug}: ${e}`);
    }
    // Fallback to legacy field
    return (retailer.paymentProvider || 'mock').toLowerCase();
  }

  // ── Resolve adapter ────────────────────────────────────────────────────────

  private async resolveAdapter(provider: string | null | undefined): Promise<PaymentGateway> {
    let key = (provider || '').toLowerCase();

    if (!key) {
      const defaultProvider = await this.settings.get('default_payment_provider');
      key = (defaultProvider || 'cod').toLowerCase();
      this.logger.debug(`No store-level provider, using gateway default: ${key}`);
    }

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
    // M4: Validate payment amount
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const retailer = await this.prisma.retailer.findUnique({
      where: { slug: input.storeSlug },
    });
    if (!retailer) throw new NotFoundException(`Store "${input.storeSlug}" not found`);

    // M5: Idempotency - check if payment already exists for this order
    const existing = await this.prisma.payment.findFirst({
      where: { storeSlug: input.storeSlug, orderId: input.orderId },
      orderBy: { createdAt: 'desc' },
    });

    // If a pending or paid payment already exists, return it instead of creating a new one
    if (existing && (existing.status === 'pending' || existing.status === 'paid')) {
      this.logger.log(`Returning existing ${existing.status} payment for order ${input.orderId}`);
      return {
        id:          existing.id,
        referenceId: existing.referenceId,
        status:      existing.status,
        paymentUrl:  existing.paymentUrl,
        successUrl:  existing.successUrl,
        cancelUrl:   existing.cancelUrl,
        provider:    existing.provider,
      };
    }

    const adapter = await this.resolveAdapter(input.providerOverride ?? this.getPrimaryProvider(retailer));
    const provider = adapter.name;

    // Load defaults for Assisted/COD if not overridden
    const paymentLinkTemplate = await this.settings.get('default_payment_link_template');
    const instructions = await this.settings.get('default_payment_instructions');

    // Resolve currency fallback (Env > DB Setting > 'PHP')
    const globalDefaultCurrency = process.env.DEFAULT_CURRENCY || (await this.settings.get('default_currency')) || 'PHP';

    const orderCtx: OrderContext = {
      orderId:    input.orderId,
      storeSlug:  input.storeSlug,
      amount:     input.amount,
      currency:   input.currency || globalDefaultCurrency,
      description: input.description,
      buyerEmail: input.buyerEmail,
      webhookUrl: `${input.baseUrl}/webhooks/payment/${input.storeSlug}`,
      successUrl: `${input.baseUrl}/payment/success?store=${input.storeSlug}&order=${input.orderId}`,
      cancelUrl:  `${input.baseUrl}/payment/cancel?store=${input.storeSlug}&order=${input.orderId}`,
      apiKey:     retailer.paymentApiKey ?? undefined,
      paymentLinkTemplate: paymentLinkTemplate || undefined,
    };

    this.logger.log(`Initiating ${provider} payment for order ${input.orderId} (${input.storeSlug})`);

    const result = await adapter.initiatePayment(orderCtx);

    try {
      // Persist the payment record
      const payment = await this.prisma.payment.create({
        data: {
          referenceId: result.referenceId,
          storeSlug:   input.storeSlug,
          orderId:     input.orderId,
          buyerRef:    input.buyerRef,
          amount:      input.amount,
          currency:    input.currency || globalDefaultCurrency,
          provider,
          status:      result.status,
          paymentUrl:  result.paymentUrl ?? null,
          successUrl:  orderCtx.successUrl,
          cancelUrl:   orderCtx.cancelUrl,
          paymentInstructions: instructions,
          orderCreatedAt:      new Date(),
        },
      });

      return {
        id:          payment.id,
        referenceId: payment.referenceId,
        status:      payment.status,
        paymentUrl:  payment.paymentUrl,
        successUrl:  payment.successUrl,
        cancelUrl:   payment.cancelUrl,
        provider:    payment.provider,
      };
    } catch (err: any) {
      // Handle race condition: if another process created the payment record between our check and create
      // Prisma error P2002 is Unique constraint failed
      if (err.code === 'P2002') {
        this.logger.warn(`Race condition: Payment already exists for order ${input.orderId}. Fetching existing record.`);
        const raceExisting = await this.prisma.payment.findUnique({
          where: {
            storeSlug_orderId: {
              storeSlug: input.storeSlug,
              orderId:   input.orderId,
            },
          },
        });
        if (raceExisting) {
          return {
            id:          raceExisting.id,
            referenceId: raceExisting.referenceId,
            status:      raceExisting.status,
            paymentUrl:  raceExisting.paymentUrl,
            successUrl:  raceExisting.successUrl,
            cancelUrl:   raceExisting.cancelUrl,
            provider:    raceExisting.provider,
          };
        }
      }
      throw err;
    }
  }

  // ── Handle incoming webhook ────────────────────────────────────────────────

  async handleWebhook(
    storeSlug: string,
    body:      unknown,
    signature: string,
  ): Promise<(WebhookEvent & { previousStatus?: string }) | null> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { slug: storeSlug },
    });
    if (!retailer) return null;

    const adapter = await this.resolveAdapter(this.getPrimaryProvider(retailer));
    
    // SEC-1: Reject webhooks if secret is missing for real providers (Stripe, PayMongo).
    // Attacker could forge a valid HMAC signature using an empty key if we silently fall back to ''.
    let secret = retailer.paymentWebhookSecret;
    if (!secret) {
      if (adapter.name === 'mock') {
        secret = 'mock-secret';
      } else if (adapter.name === 'stripe' || adapter.name === 'paymongo') {
        this.logger.error(`[SEC-1] Webhook rejected for ${storeSlug}: No secret configured for ${adapter.name}`);
        return null;
      } else {
        secret = '';
      }
    }

    const event = await adapter.handleWebhook(body, signature, secret);
    if (!event) return null;

    // Update the Payment record's status
    let previousStatus: string | undefined;
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { referenceId: event.referenceId },
      });
      previousStatus = payment?.status;

      if (payment && payment.status !== event.status) {
        await this.prisma.payment.update({
          where: { referenceId: event.referenceId },
          data:  { status: event.status },
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to update payment ${event.referenceId}: ${(err as Error).message}`,
      );
    }

    return { ...event, previousStatus };
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
      provider:      this.getPrimaryProvider(retailer),
      hasApiKey:     !!retailer?.paymentApiKey,
      hasPublicKey:  !!retailer?.paymentPublicKey,
      publicKey:     retailer?.paymentPublicKey  ?? null,
    };
  }
}
