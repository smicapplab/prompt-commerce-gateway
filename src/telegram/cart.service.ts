import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';

export interface CartItem {
  productId: number;
  title:     string;
  price:     number;
  quantity:  number;
}

@Injectable()
export class CartService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  // ── Read ──────────────────────────────────────────────────────────────────────

  async get(userId: string, storeSlug: string): Promise<CartItem[]> {
    const rows = await this.prisma.cart.findMany({
      where: { userId, storeSlug },
      orderBy: { updatedAt: 'asc' },
    });
    return rows.map(r => ({
      productId: r.productId,
      title:     r.title,
      price:     r.price,
      quantity:  r.quantity,
    }));
  }

  async total(userId: string, storeSlug: string): Promise<number> {
    const items = await this.get(userId, storeSlug);
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  async isEmpty(userId: string, storeSlug: string): Promise<boolean> {
    const count = await this.prisma.cart.count({
      where: { userId, storeSlug },
    });
    return count === 0;
  }

  // ── Write ─────────────────────────────────────────────────────────────────────

  async add(
    userId: string,
    storeSlug: string,
    item: Omit<CartItem, 'quantity'>,
    qty = 1,
  ): Promise<CartItem[]> {
    await this.prisma.cart.upsert({
      where:  { userId_storeSlug_productId: { userId, storeSlug, productId: item.productId } },
      create: { userId, storeSlug, productId: item.productId, title: item.title, price: item.price, quantity: qty },
      update: { quantity: { increment: qty }, title: item.title, price: item.price },
    });

    return this.get(userId, storeSlug);
  }

  async remove(userId: string, storeSlug: string, productId: number): Promise<CartItem[]> {
    await this.prisma.cart.deleteMany({
      where: { userId, storeSlug, productId },
    });
    return this.get(userId, storeSlug);
  }

  async updateQty(userId: string, storeSlug: string, productId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.remove(userId, storeSlug, productId);
      return;
    }
    await this.prisma.cart.updateMany({
      where:  { userId, storeSlug, productId },
      data:   { quantity },
    });
  }

  async clear(userId: string, storeSlug: string): Promise<void> {
    await this.prisma.cart.deleteMany({
      where: { userId, storeSlug },
    });
  }

  /**
   * Refreshes cart items with latest prices from the catalog cache.
   * Returns a summary of changes if any prices or stock statuses changed.
   */
  async validateCartPrices(userId: string, storeSlug: string): Promise<{ changed: boolean; oldTotal: number; newTotal: number }> {
    return this.prisma.$transaction(async (tx) => {
      const items = await tx.cart.findMany({
        where: { userId, storeSlug },
      });

      let changed = false;
      let oldTotal = 0;
      let newTotal = 0;

      for (const item of items) {
        oldTotal += item.price * item.quantity;
        const product = await tx.cachedProduct.findUnique({
          where: { storeSlug_sellerId: { storeSlug, sellerId: item.productId } },
        });

        if (!product || !product.active || product.price === null || product.price !== item.price) {
          changed = true;
          if (!product || !product.active || product.price === null) {
            // Product no longer available or has no price — remove from cart
            await tx.cart.deleteMany({
              where: { userId, storeSlug, productId: item.productId },
            });
          } else {
            // Update price in cart
            await tx.cart.update({
              where: { id: item.id },
              data: { price: product.price },
            });
            newTotal += product.price * item.quantity;
          }
        } else {
          newTotal += item.price * item.quantity;
        }
      }

      return { changed, oldTotal, newTotal };
    });
  }
}
