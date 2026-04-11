import {
  Controller, Post, Patch, Get,
  Param, Body, Headers, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { CatalogService, SyncCategoryDto, SyncProductDto, DeltaPayload } from './catalog.service';
import { KeysService } from '../keys/keys.service';
import { RegistryService } from '../registry/registry.service';

class SetAiConfigDto {
  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @IsOptional()
  @IsString()
  aiProvider?: string;

  @IsOptional()
  @IsString()
  aiApiKey?: string;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsString()
  aiSystemPrompt?: string;

  @IsOptional()
  @IsString()
  serperApiKey?: string;
}

class SetPaymentConfigDto {
  @IsOptional()
  @IsString()
  paymentProvider?: string | null;

  @IsOptional()
  @IsString()
  paymentApiKey?: string | null;

  @IsOptional()
  @IsString()
  paymentPublicKey?: string | null;

  @IsOptional()
  @IsString()
  paymentWebhookSecret?: string | null;

  @IsOptional()
  @IsString()
  paymentInstructions?: string | null;

  @IsOptional()
  @IsString()
  paymentLinkTemplate?: string | null;

  @IsOptional()
  @IsString()
  assistedLabel?: string | null;

  @IsOptional()
  @IsBoolean()
  allowCod?: boolean;

  @IsOptional()
  @IsString()
  paymentMethods?: string;
}

class SetMessagingConfigDto {
  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @IsOptional()
  @IsString()
  telegramChatId?: string | null;

  @IsOptional()
  @IsString()
  whatsappNumber?: string | null;
}

class SetGoogleConfigDto {
  @IsOptional()
  @IsString()
  googlePlacesBrowserKey?: string | null;

  @IsOptional()
  @IsString()
  googleMapsEmbedKey?: string | null;
}

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
    @Body() body: any, // We keep any here because it can be DeltaPayload or Legacy format
  ) {
    await this.validateKey(slug, platformKey);

    let result: { categories: number; products: number };

    // ── Validation: Limit batch size ────────────────────────────────────────
    const MAX_SYNC_BATCH = 1000;

    if (body.upsert || body.delete) {
      // ── Delta format ──────────────────────────────────────────────────────
      const payload = body as DeltaPayload;
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
    @Body() body: SetAiConfigDto,
  ) {
    const retailer = await this.validateKey(slug, platformKey);

    await this.registry.update(retailer.id, {
      aiEnabled:      body.aiEnabled      !== undefined ? body.aiEnabled      : retailer.aiEnabled,
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
    @Body() body: SetPaymentConfigDto,
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
    @Body() body: SetMessagingConfigDto,
  ) {
    const retailer = await this.validateKey(slug, platformKey);
    await this.registry.update(retailer.id, {
      telegramEnabled:      body.telegramEnabled !== undefined ? body.telegramEnabled : retailer.telegramEnabled,
      whatsappEnabled:      body.whatsappEnabled !== undefined ? body.whatsappEnabled : retailer.whatsappEnabled,
      telegramNotifyChatId: body.telegramChatId  !== undefined ? body.telegramChatId  : retailer.telegramNotifyChatId,
      whatsappNotifyNumber: body.whatsappNumber  !== undefined ? body.whatsappNumber  : retailer.whatsappNotifyNumber,
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

  // ── PATCH /api/stores/:slug/google-config ─────────────────────────────
  /**
   * Pushed by the seller when the store owner updates their Google Cloud settings.
   * Updates googlePlacesBrowserKey and googleMapsEmbedKey.
   *
   * Auth: x-gateway-key header
   * Body: { googlePlacesBrowserKey, googleMapsEmbedKey }
   */
  @Patch(':slug/google-config')
  async setGoogleConfig(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() body: SetGoogleConfigDto,
  ) {
    const retailer = await this.validateKey(slug, platformKey);

    await this.registry.update(retailer.id, {
      googlePlacesBrowserKey: body.googlePlacesBrowserKey !== undefined ? body.googlePlacesBrowserKey : retailer.googlePlacesBrowserKey,
      googleMapsEmbedKey:     body.googleMapsEmbedKey     !== undefined ? body.googleMapsEmbedKey     : retailer.googleMapsEmbedKey,
    });

    return { message: `Google config updated for "${slug}".` };
  }

  // ── GET /api/stores/:slug/google-config/status ────────────────────────
  /** Returns whether Google API keys are configured. Auth: x-gateway-key */
  @Get(':slug/google-config/status')
  async getGoogleConfigStatus(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
  ) {
    const retailer = await this.validateKey(slug, platformKey);
    return {
      hasPlacesKey: !!retailer.googlePlacesBrowserKey,
      hasMapsKey:   !!retailer.googleMapsEmbedKey,
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
