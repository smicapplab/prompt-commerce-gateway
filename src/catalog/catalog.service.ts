import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface SyncCategoryDto {
  id: number;
  name: string;
  parent_id?: number | null;
}

export interface SyncProductDto {
  id: number;
  title: string;
  description?: string | null;
  sku?: string | null;
  price?: number | null;
  stock_quantity?: number;
  category_id?: number | null;
  tags?: string[];
  images?: string[];
  active?: boolean;
}

export interface DeltaPayload {
  upsert: { categories: SyncCategoryDto[]; products: SyncProductDto[] };
  delete: { categoryIds: number[];         productIds: number[] };
}

@Injectable()
export class CatalogService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  // ── Delta sync ──────────────────────────────────────────────────────────────
  // Upserts changed/new items; removes soft-deleted items.
  // Called when the seller sends { upsert: {...}, delete: {...} }.
  async delta(storeSlug: string, payload: DeltaPayload): Promise<{ categories: number; products: number }> {
    const { upsert, delete: del } = payload;

    await this.prisma.$transaction(async (tx) => {
      // ── Upsert categories ───────────────────────────────────────────────────
      for (const c of upsert.categories) {
        await tx.cachedCategory.upsert({
          where:  { storeSlug_sellerId: { storeSlug, sellerId: c.id } },
          update: { name: c.name, parentId: c.parent_id ?? null, syncedAt: new Date() },
          create: { storeSlug, sellerId: c.id, name: c.name, parentId: c.parent_id ?? null },
        });
      }

      // ── Delete removed categories ───────────────────────────────────────────
      if (del.categoryIds.length > 0) {
        await tx.cachedCategory.deleteMany({
          where: { storeSlug, sellerId: { in: del.categoryIds } },
        });
      }

      // ── Upsert products ─────────────────────────────────────────────────────
      for (const p of upsert.products) {
        await tx.cachedProduct.upsert({
          where:  { storeSlug_sellerId: { storeSlug, sellerId: p.id } },
          update: {
            title:         p.title,
            description:   p.description ?? null,
            sku:           p.sku ?? null,
            price:         p.price ?? null,
            stockQuantity: p.stock_quantity ?? 0,
            categoryId:    p.category_id ?? null,
            tags:          p.tags   ?? [],
            images:        p.images ?? [],
            active:        p.active ?? true,
            syncedAt:      new Date(),
          },
          create: {
            storeSlug,
            sellerId:      p.id,
            title:         p.title,
            description:   p.description ?? null,
            sku:           p.sku ?? null,
            price:         p.price ?? null,
            stockQuantity: p.stock_quantity ?? 0,
            categoryId:    p.category_id ?? null,
            tags:          p.tags   ?? [],
            images:        p.images ?? [],
            active:        p.active ?? true,
          },
        });
      }

      // ── Delete removed products ─────────────────────────────────────────────
      if (del.productIds.length > 0) {
        await tx.cachedProduct.deleteMany({
          where: { storeSlug, sellerId: { in: del.productIds } },
        });
      }
    });

    const totalCategories = upsert.categories.length + del.categoryIds.length;
    const totalProducts   = upsert.products.length   + del.productIds.length;
    return { categories: totalCategories, products: totalProducts };
  }

  // ── Full snapshot (legacy / fallback) ──────────────────────────────────────
  // Deletes everything for the store and re-inserts from scratch.
  // Used when the payload has top-level { categories, products } (old format).
  async fullSnapshot(
    storeSlug: string,
    categories: SyncCategoryDto[],
    products: SyncProductDto[],
  ): Promise<{ categories: number; products: number }> {
    await this.prisma.$transaction([
      this.prisma.cachedCategory.deleteMany({ where: { storeSlug } }),
      this.prisma.cachedProduct.deleteMany({ where: { storeSlug } }),
      this.prisma.cachedCategory.createMany({
        data: categories.map(c => ({
          storeSlug,
          sellerId:  c.id,
          name:      c.name,
          parentId:  c.parent_id ?? null,
        })),
        skipDuplicates: true,
      }),
      this.prisma.cachedProduct.createMany({
        data: products.map(p => ({
          storeSlug,
          sellerId:      p.id,
          title:         p.title,
          description:   p.description ?? null,
          sku:           p.sku ?? null,
          price:         p.price ?? null,
          stockQuantity: p.stock_quantity ?? 0,
          categoryId:    p.category_id ?? null,
          tags:          p.tags ?? [],
          images:        p.images ?? [],
          active:        p.active ?? true,
        })),
        skipDuplicates: true,
      }),
    ]);

    return { categories: categories.length, products: products.length };
  }

  // ── Read helpers (used by Telegram bot) ──────────────────────────────────
  async getCategories(storeSlug: string) {
    return this.prisma.cachedCategory.findMany({
      where: { storeSlug },
      orderBy: { name: 'asc' },
    });
  }

  async getProducts(
    storeSlug: string,
    opts: { categoryId?: number; search?: string; limit?: number; offset?: number } = {},
  ) {
    const { categoryId, search, limit = 20, offset = 0 } = opts;
    return this.prisma.cachedProduct.findMany({
      where: {
        storeSlug,
        active: true,
        ...(categoryId != null ? { categoryId } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
      },
      orderBy: { title: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  async getProduct(storeSlug: string, sellerId: number) {
    return this.prisma.cachedProduct.findUnique({
      where: { storeSlug_sellerId: { storeSlug, sellerId } },
    });
  }

  // ── Cross-store search ────────────────────────────────────────────────────
  async searchAllStores(
    query: string,
    opts: { limit?: number; offset?: number } = {},
  ) {
    const { limit = 20, offset = 0 } = opts;
    return this.prisma.cachedProduct.findMany({
      where: {
        active: true,
        OR: [
          { title:       { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku:         { contains: query, mode: 'insensitive' } },
          { tags:        { has: query } },
        ],
      },
      orderBy: [{ price: 'asc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async countSearchAllStores(query: string): Promise<number> {
    return this.prisma.cachedProduct.count({
      where: {
        active: true,
        OR: [
          { title:       { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku:         { contains: query, mode: 'insensitive' } },
          { tags:        { has: query } },
        ],
      },
    });
  }

  async isSynced(storeSlug: string): Promise<boolean> {
    const count = await this.prisma.cachedProduct.count({ where: { storeSlug } });
    return count > 0;
  }

  async lastSyncedAt(storeSlug: string): Promise<Date | null> {
    const row = await this.prisma.cachedProduct.findFirst({
      where: { storeSlug },
      orderBy: { syncedAt: 'desc' },
      select: { syncedAt: true },
    });
    return row?.syncedAt ?? null;
  }
}
