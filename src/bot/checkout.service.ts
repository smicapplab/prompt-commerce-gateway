import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import * as crypto from 'crypto';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';
import { RegistryService } from '../registry/registry.service';
import { CartService } from '../cart/cart.service';
import { PaymentService } from '../payments/payment.service';
import { SettingsService } from '../settings/settings.service';
import { callRetailerTool } from '../mcp/retailer-client';
import { CheckoutState } from '../shared/types';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly registry: RegistryService,
    private readonly cartService: CartService,
    private readonly settings: SettingsService,
    @Optional() private readonly paymentService?: PaymentService,
  ) { }

  /**
   * Refreshes cart prices and returns a summary.
   * Shared between platforms to ensure consistency.
   */
  async getOrderSummary(userId: string, storeSlug: string, channel: 'telegram' | 'whatsapp') {
    const cartUserId = channel === 'whatsapp' ? `wa:${userId}` : userId;

    // 1. Validate prices
    const { changed, oldTotal, newTotal } = await this.cartService.validateCartPrices(cartUserId, storeSlug);

    // 2. Get items
    const items = await this.cartService.get(cartUserId, storeSlug);
    const total = await this.cartService.total(cartUserId, storeSlug);

    return {
      items,
      total,
      priceChanged: changed,
      oldTotal,
      newTotal
    };
  }

  /**
   * Core logic for order placement.
   * Calls Seller MCP and then Gateway PaymentService.
   */
  async placeOrder(userId: string, state: CheckoutState, channel: 'telegram' | 'whatsapp') {
    const { storeSlug } = state;
    const cartUserId = channel === 'whatsapp' ? `wa:${userId}` : userId;

    const items = await this.cartService.get(cartUserId, storeSlug);
    const retailer = await this.registry.findBySlug(storeSlug);

    if (!items.length) throw new Error('Your cart is empty.');
    if (!retailer) throw new Error('Store not found.');

    const total = await this.cartService.total(cartUserId, storeSlug);

    // Idempotency check: hash current cart + user + store
    const orderItems = items.map(i => ({ product_id: i.productId, quantity: i.quantity }));
    const idempotencySource = JSON.stringify({ userId, storeSlug, items: orderItems, total });
    const idempotencyKey = crypto.createHash('sha256').update(idempotencySource).digest('hex');

    // M7: Escape buyer data before passing to MCP to prevent XSS in seller admin
    const buyerName = (state.name || (channel === 'whatsapp' ? userId : 'Buyer')).replace(/[<>]/g, '');
    const buyerEmail = (state.email || '').replace(/[<>]/g, '');
    const deliveryAddress = (state.address || '').replace(/[<>]/g, '');

    // 1. Create order on Seller Server via MCP
    const mcpRes = await callRetailerTool(
      {
        slug: retailer.slug,
        mcpServerUrl: retailer.mcpServerUrl,
        platformKey: retailer.platformKey?.key || ''
      },
      'create_order',
      {
        items: orderItems,
        buyer_ref: userId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        delivery_address: deliveryAddress,
        channel,
        lat: state.lat,
        lng: state.lng,
        confirm: true,
        delivery_type: state.deliveryType || 'delivery',
        payment_provider: state.paymentMethod || retailer.paymentProvider || (await this.settings.get('default_payment_provider')) || 'cod',
        payment_instructions: retailer.paymentInstructions || (await this.settings.get('default_payment_instructions')) || '',
        idempotency_key: idempotencyKey,
      }
    ) as { content: any[] };

    const content = mcpRes.content || [];
    let orderId = 0;

    // Parse order_id from MCP response — try JSON first, then regex fallback
    for (const item of content) {
      if (item.type === 'text' && item.text?.startsWith('{')) {
        try {
          const parsed = JSON.parse(item.text);
          if (parsed.order_id) {
            orderId = parsed.order_id;
            break;
          }
        } catch { /* not JSON */ }
      }
    }

    if (!orderId) {
      const resultText: string = content.find((c: any) => c.type === 'text')?.text ?? '';
      const match = resultText.match(/Order #(\d+)/);
      if (match) orderId = parseInt(match[1], 10);
    }

    if (!orderId) {
      this.logger.error(
        `[ORDER ID PARSE FAILURE] Could not extract order_id from MCP response. ` +
        `Store: ${storeSlug}, Buyer: ${userId}. ` +
        `Full MCP response: ${JSON.stringify(mcpRes).slice(0, 1000)}`,
      );
      throw new Error('Order creation failed on seller server.');
    }

    // 2. Wrap local gateway operations in a transaction
    let result: any;
    try {
      result = await this.prisma.$transaction(async (tx) => {
        // Update user profile info ONLY (no cart clear here)
        const nameParts = (state.name || '').split(' ');
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';

        if (channel === 'telegram') {
          await tx.telegramUser.update({
            where: { id: userId },
            data: {
              lastOrderAt: new Date(),
              savedFirstName: fName,
              savedLastName: lName,
              savedEmail: state.email,
            },
          });
        } else {
          await tx.whatsAppUser.update({
            where: { id: userId },
            data: {
              lastOrderAt: new Date(),
              savedFirstName: fName,
              savedLastName: lName,
              savedEmail: state.email,
            },
          });
        }

        // 3. Initiate Payment on Gateway
        let payment = null;
        if (this.paymentService) {
          const baseUrl = (await this.settings.get('gateway_public_url')) || 'http://localhost:3002';

          payment = await this.paymentService.initiatePayment({
            orderId,
            storeSlug,
            buyerRef: userId,
            amount: total,
            description: `Order #${orderId} — ${storeSlug}`,
            baseUrl,
            providerOverride: state.paymentMethod || undefined,
            buyerEmail: state.email
          });
        }

        return {
          orderId,
          total,
          retailer,
          payment,
          items
        };
      });
    } catch (txErr) {
      // CRITICAL: Seller order was already created on the MCP server (orderId: ${orderId})
      // but the gateway transaction failed. This order is orphaned — manual reconciliation needed.
      this.logger.error(
        `[ORPHANED ORDER] Seller order #${orderId} created on ${storeSlug} MCP server ` +
        `but gateway transaction failed. Manual reconciliation required. ` +
        `Buyer: ${userId}, Store: ${storeSlug}, Amount: ${total}. ` +
        `Error: ${(txErr as Error).message}`,
      );
      throw txErr;
    }

    // 4. Clear cart AFTER transaction commits successfully
    await this.cartService.clear(cartUserId, storeSlug);

    return result;
  }

  /**
   * Rate limiting logic shared between platforms.
   */
  async checkRateLimit(userId: string, platform: 'telegram' | 'whatsapp'): Promise<{ allowed: boolean; waitSec?: number }> {
    const thirtySecsAgo = new Date(Date.now() - 30_000);
    const table = platform === 'telegram' ? this.prisma.telegramUser : this.prisma.whatsAppUser;

    const updated = await (table as any).updateMany({
      where: {
        id: userId,
        OR: [
          { lastOrderAt: null },
          { lastOrderAt: { lt: thirtySecsAgo } }
        ]
      },
      data: { lastOrderAt: new Date() }
    });

    if (updated.count === 0) {
      const user = await (table as any).findUnique({ where: { id: userId } });
      if (user) {
        const lastAt = user.lastOrderAt?.getTime() || 0;
        const waitSec = Math.ceil((30_000 - (Date.now() - lastAt)) / 1000);
        return { allowed: false, waitSec };
      }
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * Shared logic for saving and applying a delivery address.
   */
  async saveAddress(params: {
    userId: string;
    platform: 'telegram' | 'whatsapp';
    state: CheckoutState;
    label: string;
  }) {
    const { userId, platform, state, label } = params;

    const province = state.province || '';
    const city = state.city || '';
    const barangay = state.barangay || '';

    if (label && label !== 'skip') {
      const table = platform === 'telegram' ? this.prisma.telegramAddress : this.prisma.whatsAppAddress;

      const count = await (table as any).count({ where: { userId } });

      const record = await (table as any).create({
        data: {
          userId,
          label: label.slice(0, 50),
          streetLine: state.streetLine!,
          barangay: barangay || null,
          city: city || '',
          province: province || '',
          postalCode: state.postalCode ?? null,
          lat: state.lat ?? null,
          lng: state.lng ?? null,
          isDefault: count === 0
        }
      });
      state.addressId = record.id;
    }

    state.address = [state.streetLine, barangay, city, province, state.postalCode].filter(Boolean).join(', ');
    return state;
  }
}
