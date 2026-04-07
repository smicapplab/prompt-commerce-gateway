import {
  Controller, Post, Patch, Get,
  Param, Body, Headers, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { CatalogService, type SyncCategoryDto, type SyncProductDto, type DeltaPayload } from './catalog.service';
import { KeysService } from '../keys/keys.service';
import { RegistryService } from '../registry/registry.service';

// ─── Platform-key guard (shared by both endpoints) ───────────────────────────
// The seller doesn't hold a gateway JWT — it authenticates with its platform
// key (x-gateway-key header) so it can push data to its own store record.

@Controller('api/stores')
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly keys: KeysService,
    private readonly registry: RegistryService,
  ) {}

  // ── POST /api/stores/:slug/sync ─────────────────────────────────────────
  /**
   * Accepts two payload formats:
   *
   * Delta (new, preferred):
   *   { upsert: { categories, products }, delete: { categoryIds, productIds } }
   *   → Only processes changed rows; preserves everything else in the cache.
   *
   * Full snapshot (legacy fallback):
   *   { categories: [...], products: [...] }
   *   → Wipes everything and re-inserts from scratch.
   *
   * Auth: x-gateway-key header (seller's platform key)
   */
  @Post(':slug/sync')
  async sync(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() body: Record<string, unknown>,
  ) {
    await this.validateKey(slug, platformKey);

    let result: { categories: number; products: number };

    // ── Validation: Limit batch size ────────────────────────────────────────
    const MAX_SYNC_BATCH = 1000;

    if ('upsert' in body) {
      // ── Delta format ──────────────────────────────────────────────────────
      const payload = body as unknown as DeltaPayload;
      if (
        (payload.upsert?.products?.length ?? 0) > MAX_SYNC_BATCH ||
        (payload.upsert?.categories?.length ?? 0) > MAX_SYNC_BATCH ||
        (payload.delete?.productIds?.length ?? 0) > MAX_SYNC_BATCH ||
        (payload.delete?.categoryIds?.length ?? 0) > MAX_SYNC_BATCH
      ) {
        throw new UnauthorizedException(`Sync payload exceeds limit of ${MAX_SYNC_BATCH} items per request.`);
      }
      result = await this.catalog.delta(slug, payload);
    } else {
      // ── Legacy full-snapshot format ───────────────────────────────────────
      const b = body as { categories?: SyncCategoryDto[]; products?: SyncProductDto[] };
      if ((b.categories?.length ?? 0) > MAX_SYNC_BATCH || (b.products?.length ?? 0) > MAX_SYNC_BATCH) {
        throw new UnauthorizedException(`Sync payload exceeds limit of ${MAX_SYNC_BATCH} items per request.`);
      }
      result = await this.catalog.fullSnapshot(slug, b.categories ?? [], b.products ?? []);
    }

    return { message: `Sync complete for "${slug}".`, ...result };
  }

  // ── PATCH /api/stores/:slug/ai-config ──────────────────────────────────
  /**
   * Pushed by the seller when the store owner updates their AI settings.
   * Updates aiProvider, aiApiKey, aiModel, aiSystemPrompt, serperApiKey on the Retailer row.
   *
   * Auth: x-gateway-key header (seller's platform key)
   * Body: { aiProvider, aiApiKey, aiModel, aiSystemPrompt, serperApiKey }
   */
  @Patch(':slug/ai-config')
  async setAiConfig(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() body: {
      aiProvider?:     string;
      aiApiKey?:       string;
      aiModel?:        string;
      aiSystemPrompt?: string;
      serperApiKey?:   string;
    },
  ) {
    const retailer = await this.validateKey(slug, platformKey);

    await this.registry.update(retailer.id, {
      aiProvider:     body.aiProvider     ?? null,
      aiApiKey:       body.aiApiKey       ?? null,
      aiModel:        body.aiModel        ?? null,
      aiSystemPrompt: body.aiSystemPrompt ?? null,
      serperApiKey:   body.serperApiKey   ?? null,
    });

    return { message: `AI config updated for "${slug}".` };
  }

  // ── GET /api/stores/:slug/ai-config/status ─────────────────────────────
  /**
   * Used by the seller UI to verify the last push was received.
   * Returns { hasApiKey: boolean } — true if this store has an AI key stored.
   * Auth: x-gateway-key header.
   */
  @Get(':slug/ai-config/status')
  async getAiConfigStatus(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
  ) {
    const retailer = await this.validateKey(slug, platformKey);
    return { hasApiKey: !!retailer.aiApiKey };
  }

  // ── PATCH /api/stores/:slug/payment-config ─────────────────────────────
  /**
   * Pushed by the seller when the store owner updates their payment settings.
   * Updates paymentProvider, paymentApiKey, paymentPublicKey, paymentWebhookSecret.
   * Secret keys are stored but never returned to the client.
   *
   * Auth: x-gateway-key header
   * Body: { paymentProvider, paymentApiKey, paymentPublicKey, paymentWebhookSecret }
   */
  @Patch(':slug/payment-config')
  async setPaymentConfig(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() body: {
      paymentProvider?:      string | null;
      paymentApiKey?:        string | null;
      paymentPublicKey?:     string | null;
      paymentWebhookSecret?: string | null;
      paymentInstructions?: string | null;
      paymentLinkTemplate?: string | null;
      assistedLabel?:       string | null;
      allowCod?:            boolean;
      paymentMethods?:      string;
    },
  ) {
    const retailer = await this.validateKey(slug, platformKey);

    let methods: string[] = [];
    try {
      methods = JSON.parse(body.paymentMethods || '[]');
    } catch {
      methods = [];
    }

    if (methods.length === 0) {
      // Reconstruct from legacy fields
      if (body.allowCod !== false) methods.push('cod');
      const p = (body.paymentProvider || '').toLowerCase();
      if (p && p !== 'none' && p !== 'cod') methods.push(p);
    }

    let webhookSecret = body.paymentWebhookSecret ?? null;
    if (body.paymentProvider === 'mock' && !webhookSecret) {
      webhookSecret = 'mock-secret';
    }

    await this.registry.update(retailer.id, {
      paymentProvider:      body.paymentProvider      ?? null,
      paymentApiKey:        body.paymentApiKey        ?? null,
      paymentPublicKey:     body.paymentPublicKey     ?? null,
      paymentWebhookSecret: webhookSecret,
      paymentInstructions:  body.paymentInstructions   ?? null,
      paymentLinkTemplate:  body.paymentLinkTemplate   ?? null,
      assistedLabel:        body.assistedLabel        ?? null,
      allowCod:             body.allowCod             ?? true,
      paymentMethods:       JSON.stringify(methods),
    });

    return { message: `Payment config updated for "${slug}".` };
  }

  // ── GET /api/stores/:slug/payment-config/status ────────────────────────
  /**
   * Returns the payment provider and whether credentials are configured.
   * Public key is returned (safe to share); secret key is never exposed.
   * Auth: x-gateway-key header.
   */
  @Get(':slug/payment-config/status')
  async getPaymentConfigStatus(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
  ) {
    const retailer = await this.validateKey(slug, platformKey);
    return {
      provider:     retailer.paymentProvider  ?? 'mock',
      hasApiKey:    !!retailer.paymentApiKey,
      hasPublicKey: !!retailer.paymentPublicKey,
      publicKey:    retailer.paymentPublicKey  ?? null,
    };
  }

  // ── PATCH /api/stores/:slug/messaging-config ───────────────────────────
  /**
   * Pushed by the seller when the store owner sets their notification endpoints.
   * Body: { telegramChatId: string | null, whatsappNumber: string | null }
   * Auth: x-gateway-key header
   */
  @Patch(':slug/messaging-config')
  async setMessagingConfig(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() body: { telegramChatId?: string | null; whatsappNumber?: string | null },
  ) {
    const retailer = await this.validateKey(slug, platformKey);
    await this.registry.update(retailer.id, {
      telegramNotifyChatId: body.telegramChatId !== undefined ? body.telegramChatId : retailer.telegramNotifyChatId,
      whatsappNotifyNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : retailer.whatsappNotifyNumber,
    });
    return { message: `Messaging config updated for "${slug}".` };
  }

  // ── GET /api/stores/:slug/messaging-config/status ──────────────────────
  /** Returns whether notification endpoints are configured. Auth: x-gateway-key */
  @Get(':slug/messaging-config/status')
  async getMessagingConfigStatus(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
  ) {
    const retailer = await this.validateKey(slug, platformKey);
    return { 
      hasTelegramSetup: !!retailer.telegramNotifyChatId,
      hasWhatsappSetup: !!retailer.whatsappNotifyNumber 
    };
  }

  // ── GET /api/stores/:slug/sync/status ─────────────────────────────────
  /**
   * Returns whether the store has been synced and when.
   * Auth: x-gateway-key header.
   */
  @Get(':slug/sync/status')
  async syncStatus(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
  ) {
    await this.validateKey(slug, platformKey);
    const synced     = await this.catalog.isSynced(slug);
    const lastSynced = await this.catalog.lastSyncedAt(slug);
    return { slug, synced, lastSyncedAt: lastSynced };
  }

  // ── Shared: validate platform key → return retailer ──────────────────
  private async validateKey(slug: string, platformKey: string) {
    if (!platformKey) throw new UnauthorizedException('x-gateway-key header required.');

    const retailer = await this.registry.findBySlug(slug).catch(() => null);
    if (!retailer) throw new NotFoundException(`Store "${slug}" not found.`);

    const valid = await this.keys.validateKey(platformKey);
    if (!valid || valid.slug !== slug) {
      throw new UnauthorizedException('Invalid or mismatched platform key.');
    }

    return retailer;
  }
}
