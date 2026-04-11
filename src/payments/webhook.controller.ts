// ─── Webhook Controller ───────────────────────────────────────────────────────
// Receives payment provider callbacks and updates order status.
//
//   POST /webhooks/payment/:slug    ← PayMongo / Stripe POST here
//   GET  /payment/success           ← buyer redirect after successful checkout
//   GET  /payment/cancel            ← buyer redirect on cancel / failure

import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  Res,
  Headers,
  RawBodyRequest,
  HttpCode,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';

import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { TelegramService } from '../telegram/telegram.service';
import { SettingsService } from '../settings/settings.service';
import { KeysService } from '../keys/keys.service';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';

class SetBotConfigDto {
  @IsOptional()
  @IsString()
  webhookUrl?: string | null;
}

@Controller()
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly paymentService: PaymentService,
    private readonly telegramService: TelegramService,
    private readonly settings: SettingsService,
    private readonly keys: KeysService,
  ) {}

  // ── Bot config (pushed by seller when Telegram settings are saved) ────────

  /**
   * PATCH /api/bot/telegram
   * Auth: x-gateway-key from any active store
   * Body: { webhookUrl?: string | null }
   * Saves the webhook URL globally and reinitialises the bot immediately.
   */
  @Patch('api/bot/telegram')
  async setBotConfig(
    @Headers('x-gateway-key') gatewayKey: string,
    @Body() body: SetBotConfigDto,
  ) {
    await this.validateAnyStoreKey(gatewayKey);

    const url = body.webhookUrl?.trim() || null;
    if (url) {
      await this.settings.set('telegram_webhook_url', url);
    } else {
      await this.settings.delete('telegram_webhook_url');
    }

    // Reinitialise bot immediately so the change takes effect without a restart
    await this.telegramService.initBot();

    return { message: url ? `Webhook mode enabled → ${url}` : 'Polling mode enabled', webhookUrl: url };
  }

  /**
   * GET /api/bot/telegram/status
   * Auth: x-gateway-key from any active store
   * Returns current mode (polling|webhook) plus live Telegram webhook info.
   */
  @Get('api/bot/telegram/status')
  async getBotStatus(@Headers('x-gateway-key') gatewayKey: string) {
    await this.validateAnyStoreKey(gatewayKey);
    const status = await this.telegramService.getWebhookStatus();
    const webhookUrl = await this.settings.get('telegram_webhook_url');
    return { ...status, configuredUrl: webhookUrl ?? null };
  }

  private async validateAnyStoreKey(gatewayKey: string): Promise<void> {
    if (!gatewayKey) throw new UnauthorizedException('x-gateway-key header required.');
    const valid = await this.keys.validateKey(gatewayKey);
    if (!valid) throw new UnauthorizedException('Invalid gateway key.');
  }

  // ── Rate Limiting (Persistent via Prisma) ──────────────────────────────────

  private async isRateLimited(ip: string): Promise<boolean> {
    const key = `webhook_rate_limit:${ip}`;
    const now = new Date();
    const limit = 10; // requests
    const windowMs = 60000; // 1 minute

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Prune expired entries to keep the table size under control
        await tx.rateLimit.deleteMany({ where: { resetAt: { lt: now } } });

        const record = await tx.rateLimit.findUnique({ where: { key } });

        if (!record || now > record.resetAt) {
          await tx.rateLimit.upsert({
            where: { key },
            create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
            update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
          });
          return false;
        }

        const newCount = record.count + 1;
        await tx.rateLimit.update({
          where: { key },
          data: { count: newCount },
        });

        return newCount > limit;
      });
    } catch (err) {
      this.logger.error(`Rate limit check failed for ${ip}: ${err}`);
      return false; // Fail open to avoid blocking valid webhooks
    }
  }

  // ── Telegram webhook ───────────────────────────────────────────────────────

  @Post('webhooks/telegram')
  @HttpCode(200)
  async handleTelegramWebhook(
    @Req() req: Request,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
  ) {
    if (!this.telegramService.validateWebhookSecret(secretToken ?? '')) {
      this.logger.warn('Telegram webhook: invalid or missing secret token — ignoring');
      // Return 200 anyway so Telegram doesn't retry; just silently discard
      return { ok: true };
    }
    await this.telegramService.handleUpdate(req.body);
    return { ok: true };
  }

  // ── Provider webhook ───────────────────────────────────────────────────────

  @Post('webhooks/payment/:slug')
  @HttpCode(200)
  async handlePaymentWebhook(
    @Param('slug') slug: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('paymongo-signature') paymongoSig?: string,
    @Headers('stripe-signature') stripeSig?: string,
  ) {
    // req.ip is trusted when app.set('trust proxy', true) is enabled in main.ts
    const ip = req.ip || 
               (req.headers['x-forwarded-for'] as string || '').split(',').pop()?.trim() || 
               req.socket.remoteAddress || 
               'unknown';
               
    if (await this.isRateLimited(ip)) {
      this.logger.warn(`Webhook rate limit hit for IP ${ip} (slug: ${slug})`);
      throw new HttpException({
        status: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too many requests',
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // L4: Ensure Content-Type is application/json
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      this.logger.warn(`Webhook for ${slug} rejected: Invalid Content-Type (${contentType})`);
      return { received: false, error: 'Invalid Content-Type' };
    }

    const signature = paymongoSig ?? stripeSig ?? '';
    // Use raw body for signature verification; fall back to parsed body
    const body = req.rawBody ? req.rawBody.toString('utf8') : req.body;

    const event = await this.paymentService.handleWebhook(slug, body, signature);
    if (!event) {
      this.logger.warn(`Webhook for ${slug}: ignored (invalid sig or unknown event)`);
      return { received: true };
    }

    this.logger.log(`Webhook for ${slug}: ${event.referenceId} → ${event.status}`);

    // Look up the payment record to get orderId and buyerRef
    const payment = await this.paymentService.findByReference(event.referenceId);
    if (!payment) {
      this.logger.warn(`No payment record found for referenceId ${event.referenceId}`);
      return { received: true };
    }

    // Notify Telegram user about the payment status change (deduplicated)
    // M3: Double-check status change strictly. previousStatus is from the Payment record BEFORE the update.
    if (event.previousStatus === 'pending' && (event.status === 'paid' || event.status === 'failed')) {
      await this.telegramService.notifyPaymentStatus({
        buyerRef:    payment.buyerRef,
        storeSlug:   payment.storeSlug,
        orderId:     payment.orderId,
        status:      event.status,
        referenceId: event.referenceId,
      });
    }

    return { received: true };
  }

  // ── Buyer redirect pages ───────────────────────────────────────────────────

  @Get('payment/success')
  paymentSuccess(@Res() res: Response) {
    res.send(`
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Successful</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center;
                 justify-content: center; min-height: 100vh; margin: 0; background: #f0fdf4; }
          .card { background: white; border-radius: 16px; padding: 48px 40px;
                  text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,.08); max-width: 360px; }
          .icon { font-size: 56px; margin-bottom: 16px; }
          h1 { color: #16a34a; margin: 0 0 12px; }
          p  { color: #6b7280; margin: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Your order has been confirmed. You can close this tab and return to Telegram.</p>
        </div>
      </body>
      </html>
    `);
  }

  @Get('payment/cancel')
  paymentCancel(@Res() res: Response) {
    res.send(`
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Cancelled</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center;
                 justify-content: center; min-height: 100vh; margin: 0; background: #fef9f0; }
          .card { background: white; border-radius: 16px; padding: 48px 40px;
                  text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,.08); max-width: 360px; }
          .icon { font-size: 56px; margin-bottom: 16px; }
          h1 { color: #d97706; margin: 0 0 12px; }
          p  { color: #6b7280; margin: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">↩️</div>
          <h1>Payment Cancelled</h1>
          <p>No charge was made. Return to Telegram and try again if you'd like to complete your order.</p>
        </div>
      </body>
      </html>
    `);
  }
}
