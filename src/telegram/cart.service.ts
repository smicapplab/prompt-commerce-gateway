import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '../generated/client';

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

  async get(userId: number, storeSlug: string): Promise<CartItem[]> {
    const rows = await this.prisma.cart.findMany({
      where: { userId: String(userId), storeSlug },
      orderBy: { updatedAt: 'asc' },
    });
    return rows.map(r => ({
      productId: r.productId,
      title:     r.title,
      price:     r.price,
      quantity:  r.quantity,
    }));
  }

  async total(userId: number, storeSlug: string): Promise<number> {
    const items = await this.get(userId, storeSlug);
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  async isEmpty(userId: number, storeSlug: string): Promise<boolean> {
    const count = await this.prisma.cart.count({
      where: { userId: String(userId), storeSlug },
    });
    return count === 0;
  }

  // ── Write ─────────────────────────────────────────────────────────────────────

  async add(
    userId: number,
    storeSlug: string,
    item: Omit<CartItem, 'quantity'>,
    qty = 1,
  ): Promise<CartItem[]> {
    const uid = String(userId);

    await this.prisma.cart.upsert({
      where:  { userId_storeSlug_productId: { userId: uid, storeSlug, productId: item.productId } },
      create: { userId: uid, storeSlug, productId: item.productId, title: item.title, price: item.price, quantity: qty },
      update: { quantity: { increment: qty }, title: item.title, price: item.price },
    });

    return this.get(userId, storeSlug);
  }

  async remove(userId: number, storeSlug: string, productId: number): Promise<CartItem[]> {
    await this.prisma.cart.deleteMany({
      where: { userId: String(userId), storeSlug, productId },
    });
    return this.get(userId, storeSlug);
  }

  async updateQty(userId: number, storeSlug: string, productId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.remove(userId, storeSlug, productId);
      return;
    }
    await this.prisma.cart.updateMany({
      where:  { userId: String(userId), storeSlug, productId },
      data:   { quantity },
    });
  }

  async clear(userId: number, storeSlug: string): Promise<void> {
    await this.prisma.cart.deleteMany({
      where: { userId: String(userId), storeSlug },
    });
  }
}
