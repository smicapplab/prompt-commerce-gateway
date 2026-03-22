// ─── Webhook Controller ───────────────────────────────────────────────────────
// Receives payment provider callbacks and updates order status.
//
//   POST /webhooks/payment/:slug    ← PayMongo / Stripe POST here
//   GET  /payment/success           ← buyer redirect after successful checkout
//   GET  /payment/cancel            ← buyer redirect on cancel / failure

import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  Res,
  Headers,
  RawBodyRequest,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { TelegramService } from '../telegram/telegram.service';

@Controller()
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly telegramService: TelegramService,
  ) {}

  // ── Provider webhook ───────────────────────────────────────────────────────

  @Post('webhooks/payment/:slug')
  @HttpCode(200)
  async handlePaymentWebhook(
    @Param('slug') slug: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('paymongo-signature') paymongoSig?: string,
    @Headers('stripe-signature') stripeSig?: string,
  ) {
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

    // Notify Telegram user about the payment status change
    if (event.status === 'paid' || event.status === 'failed') {
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
