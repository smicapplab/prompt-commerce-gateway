// ─── Mock Payment Checkout Controller ─────────────────────────────────────────
// Serves a fake checkout page for testing the redirect flow locally.

import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  NotFoundException,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { TelegramService } from '../telegram/telegram.service';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';

@Controller('mock-pay')
export class MockPayController implements OnModuleInit {
  private readonly logger = new Logger(MockPayController.name);
  private readonly mockTokens = new Map<string, string>();

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly paymentService: PaymentService,
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    // Prune all mock tokens every 30 minutes to prevent memory leaks.
    // They are only needed during a 10-minute session anyway.
    setInterval(() => {
      this.mockTokens.clear();
      this.logger.log('Pruned mock payment tokens.');
    }, 30 * 60 * 1000).unref();
  }

  @Get()
  async showCheckout(@Query('ref') referenceId: string, @Res() res: Response) {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MOCK_PAYMENT !== 'true') {
      throw new NotFoundException();
    }

    if (!referenceId) throw new NotFoundException('Missing reference ID');

    const payment = await this.paymentService.findByReference(referenceId);
    if (!payment || payment.status !== 'pending') {
      return res.redirect('/payment/cancel');
    }

    const token = Math.random().toString(36).substring(2, 15);
    this.mockTokens.set(referenceId, token);

    const retailer = await this.prisma.retailer.findUnique({
      where: { slug: payment.storeSlug },
    });

    const storeName = retailer?.name || payment.storeSlug;
    const escStoreName = (storeName || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const amountFormatted = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: payment.currency,
    }).format(payment.amount);

    res.send(`
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Mock Checkout — ${storeName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6;
                 margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .container { background: white; width: 100%; max-width: 400px; border-radius: 12px;
                       box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); overflow: hidden; margin: 16px; }
          .banner { background: #fef3c7; color: #92400e; padding: 12px; text-align: center;
                    font-size: 14px; font-weight: 600; border-bottom: 1px solid #fde68a; }
          .header { padding: 24px; border-bottom: 1px solid #f3f4f6; }
          .store-name { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
          .amount { font-size: 32px; font-weight: 800; color: #111827; margin: 8px 0; }
          .description { font-size: 14px; color: #6b7280; margin: 0; }
          .form { padding: 24px; }
          .field { margin-bottom: 16px; }
          label { display: block; font-size: 12px; font-weight: 600; color: #374151;
                  text-transform: uppercase; margin-bottom: 4px; }
          input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;
                  box-sizing: border-box; font-size: 16px; background: #f9fafb; color: #111827; }
          .row { display: flex; gap: 12px; }
          .btn { width: 100%; padding: 14px; border: none; border-radius: 6px; font-size: 16px;
                 font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
          .btn-primary { background: #2563eb; color: white; }
          .btn-primary:hover { background: #1d4ed8; }
          .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
          .cancel { display: block; text-align: center; margin-top: 16px; font-size: 14px;
                    color: #6b7280; text-decoration: none; }
          .cancel:hover { text-decoration: underline; }
          .spinner { display: none; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,.3);
                     border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;
                     margin: 0 auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      <title>Mock Checkout — ${escStoreName}</title>
      ...
      <div class="container">
        <div class="banner">🧪 TEST MODE — No real payment will be made</div>
        <div class="header">
          <p class="store-name">${escStoreName}</p>
          <p class="amount">${amountFormatted}</p>
          <p class="description">Order #${payment.orderId}</p>
        </div>
          <div class="form">
            <div class="field">
              <label>Card Number</label>
              <input type="text" value="4242 4242 4242 4242">
            </div>
            <div class="field">
              <label>Name on Card</label>
              <input type="text" value="Test Buyer">
            </div>
            <div class="row">
              <div class="field" style="flex: 2;">
                <label>Expiry</label>
                <input type="text" value="12 / 29">
              </div>
              <div class="field" style="flex: 1;">
                <label>CVV</label>
                <input type="text" value="123">
              </div>
            </div>
            <button id="payBtn" class="btn btn-primary" onclick="processPayment()">
              <span id="btnText">Pay ${amountFormatted}</span>
              <div id="spinner" class="spinner"></div>
            </button>
            <a href="/mock-pay/cancel?ref=${referenceId}" class="cancel">Cancel and return</a>
          </div>
        </div>

        <script>
          async function processPayment() {
            const btn = document.getElementById('payBtn');
            const text = document.getElementById('btnText');
            const spinner = document.getElementById('spinner');

            btn.disabled = true;
            text.style.display = 'none';
            spinner.style.display = 'block';

            // Artificial delay to simulate real processing
            await new Promise(r => setTimeout(r, 1500));

            try {
              const res = await fetch('/mock-pay/confirm?ref=${referenceId}&token=${token}', { method: 'POST' });
              if (res.redirected) {
                window.location.href = res.url;
              } else {
                const data = await res.json();
                if (data.redirectUrl) {
                  window.location.href = data.redirectUrl;
                } else {
                  alert('Payment failed: ' + (data.error || 'Unknown error'));
                  btn.disabled = false;
                  text.style.display = 'block';
                  spinner.style.display = 'none';
                }
              }
            } catch (err) {
              alert('Network error. Please try again.');
              btn.disabled = false;
              text.style.display = 'block';
              spinner.style.display = 'none';
            }
          }
        </script>
      </body>
      </html>
    `);
  }

  @Post('confirm')
  async confirmPayment(
    @Query('ref') referenceId: string, 
    @Query('token') token: string,
    @Res() res: Response
  ) {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MOCK_PAYMENT !== 'true') {
      throw new NotFoundException();
    }

    const expectedToken = this.mockTokens.get(referenceId);
    if (!expectedToken || expectedToken !== token) {
      throw new UnauthorizedException('Invalid or expired CSRF token');
    }
    this.mockTokens.delete(referenceId);

    const payment = await this.paymentService.findByReference(referenceId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'pending') {
      return res.json({ redirectUrl: payment.successUrl || '/payment/success' });
    }

    // Trigger the webhook flow internally
    const body = { type: 'mock.payment.paid', referenceId };
    const retailer = await this.prisma.retailer.findUnique({
      where: { slug: payment.storeSlug },
    });

    // We use a fixed secret for mock or the one stored in DB
    const secret = retailer?.paymentWebhookSecret || 'mock-secret';
    const event = await this.paymentService.handleWebhook(payment.storeSlug, body, secret);

    if (!event) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Notify Telegram (only if it wasn't already paid)
    if (event.previousStatus !== 'paid') {
      await this.telegramService.notifyPaymentStatus({
        buyerRef:    payment.buyerRef,
        storeSlug:   payment.storeSlug,
        orderId:     payment.orderId,
        status:      'paid',
        referenceId: payment.referenceId,
      });
    }

    return res.json({ redirectUrl: payment.successUrl || '/payment/success' });
  }

  @Get('cancel')
  async cancelPayment(@Query('ref') referenceId: string, @Res() res: Response) {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MOCK_PAYMENT !== 'true') {
      throw new NotFoundException();
    }
    const payment = await this.paymentService.findByReference(referenceId);
    if (!payment) return res.redirect('/payment/cancel');

    // We leave the payment as 'pending' so they can try again if they want
    return res.redirect(payment.cancelUrl || '/payment/cancel');
  }
}
