import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { parseSearchQuery } from './parse-search-query';

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
      await Promise.all(upsert.categories.map((c) =>
        tx.cachedCategory.upsert({
          where:  { storeSlug_sellerId: { storeSlug, sellerId: c.id } },
          update: { name: c.name, parentId: c.parent_id ?? null, syncedAt: new Date() },
          create: { storeSlug, sellerId: c.id, name: c.name, parentId: c.parent_id ?? null },
        })
      ));

      // ── Delete removed categories ───────────────────────────────────────────
      if (del.categoryIds.length > 0) {
        await tx.cachedCategory.deleteMany({
          where: { storeSlug, sellerId: { in: del.categoryIds } },
        });
      }

      // ── Upsert products ─────────────────────────────────────────────────────
      await Promise.all(upsert.products.map((p) =>
        tx.cachedProduct.upsert({
          where:  { storeSlug_sellerId: { storeSlug, sellerId: p.id } },
          update: {
            title:         p.title,
            description:   p.description ?? null,
            sku:           p.sku ?? null,
            price:         p.price ?? null,
            stockQuantity: p.stock_quantity ?? 0,
            categoryId:    p.category_id ?? null,
            tags:          p.tags?.map(t => t.toLowerCase()) ?? [],
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
            tags:          p.tags?.map(t => t.toLowerCase()) ?? [],
            images:        p.images ?? [],
            active:        p.active ?? true,
          },
        })
      ));

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
  // Used when the payload has top-level { categories, products } (old format).
  // Uses an upsert-then-prune strategy to avoid an "empty-catalog read window"
  // during sync.
  async fullSnapshot(
    storeSlug: string,
    categories: SyncCategoryDto[],
    products: SyncProductDto[],
  ): Promise<{ categories: number; products: number }> {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // 1. Upsert all categories with new timestamp
      await Promise.all(categories.map((c) =>
        tx.cachedCategory.upsert({
          where: { storeSlug_sellerId: { storeSlug, sellerId: c.id } },
          update: { name: c.name, parentId: c.parent_id ?? null, syncedAt: now },
          create: { storeSlug, sellerId: c.id, name: c.name, parentId: c.parent_id ?? null, syncedAt: now },
        })
      ));

      // 2. Upsert all products with new timestamp
      await Promise.all(products.map((p) =>
        tx.cachedProduct.upsert({
          where: { storeSlug_sellerId: { storeSlug, sellerId: p.id } },
          update: {
            title:         p.title,
            description:   p.description ?? null,
            sku:           p.sku ?? null,
            price:         p.price ?? null,
            stockQuantity: p.stock_quantity ?? 0,
            categoryId:    p.category_id ?? null,
            tags:          p.tags?.map(t => t.toLowerCase()) ?? [],
            images:        p.images ?? [],
            active:        p.active ?? true,
            syncedAt:      now,
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
            tags:          p.tags?.map(t => t.toLowerCase()) ?? [],
            images:        p.images ?? [],
            active:        p.active ?? true,
            syncedAt:      now,
          },
        })
      ));

      // 3. Delete items that were NOT updated in this sync batch
      await tx.cachedCategory.deleteMany({
        where: { storeSlug, syncedAt: { lt: now } },
      });
      await tx.cachedProduct.deleteMany({
        where: { storeSlug, syncedAt: { lt: now } },
      });
    });

    return { categories: categories.length, products: products.length };
  }

  // ── Read helpers (used by Telegram bot) ──────────────────────────────────
  async getCategories(storeSlug: string) {
    return this.prisma.cachedCategory.findMany({
      where: { storeSlug },
      orderBy: { name: 'asc' },
    });
  }

  private _buildStoreProductsWhere(storeSlug: string, categoryId?: number, search?: string) {
    const and: any[] = [{ storeSlug, active: true }];
    if (categoryId != null) and.push({ categoryId });
    
    if (search) {
      const parsed = parseSearchQuery(search);
      const searchWhere = this._buildSearchWhere(parsed.keywords, {
        maxPrice: parsed.maxPrice,
        minPrice: parsed.minPrice,
        inStockOnly: parsed.inStockOnly,
      });
      if (searchWhere.AND) and.push(...searchWhere.AND);
    }
    
    return { AND: and };
  }

  async getProducts(
    storeSlug: string,
    opts: { categoryId?: number; search?: string; limit?: number; offset?: number; sort?: string } = {},
  ) {
    const { categoryId, search, limit = 20, offset = 0, sort } = opts;
    
    let orderBy: any = { title: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { syncedAt: 'desc' };

    return this.prisma.cachedProduct.findMany({
      where: this._buildStoreProductsWhere(storeSlug, categoryId, search),
      orderBy,
      take: limit,
      skip: offset,
    });
  }

  async countProducts(
    storeSlug: string,
    opts: { categoryId?: number; search?: string } = {},
  ) {
    return this.prisma.cachedProduct.count({
      where: this._buildStoreProductsWhere(storeSlug, opts.categoryId, opts.search)
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
    opts: {
      limit?:       number;
      offset?:      number;
      maxPrice?:    number;
      minPrice?:    number;
      inStockOnly?: boolean;
    } = {},
  ) {
    const { limit = 20, offset = 0, maxPrice, minPrice, inStockOnly } = opts;
    return this.prisma.cachedProduct.findMany({
      where: this._buildSearchWhere(query, { maxPrice, minPrice, inStockOnly }),
      orderBy: [{ price: 'asc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async smartSearch(rawQuery: string, opts: { limit?: number; offset?: number } = {}) {
    const parsed = parseSearchQuery(rawQuery || '');
    const filterOpts = {
      limit: opts.limit,
      offset: opts.offset,
      maxPrice: parsed.maxPrice,
      minPrice: parsed.minPrice,
      inStockOnly: parsed.inStockOnly,
    };

    // Strategy 1: strict AND — every keyword must appear in title/desc/sku/tags
    let [results, total] = await Promise.all([
      this.searchAllStores(parsed.keywords, filterOpts),
      this.countSearchAllStores(parsed.keywords, filterOpts),
    ]);

    // Strategy 2: OR fallback — any keyword matches (catches partial/synonym matches)
    let fallback = false;
    if (total === 0 && parsed.keywords.trim()) {
      [results, total] = await Promise.all([
        this.searchAllStoresOr(parsed.keywords, filterOpts),
        this.countSearchAllStoresOr(parsed.keywords, filterOpts),
      ]);
      if (total > 0) fallback = true;
    }

    return { results, total, parsed, fallback };
  }

  // OR search: any keyword matches across title, description, sku, or tags
  async searchAllStoresOr(
    query: string,
    opts: {
      limit?:       number;
      offset?:      number;
      maxPrice?:    number;
      minPrice?:    number;
      inStockOnly?: boolean;
    } = {},
  ) {
    const { limit = 20, offset = 0, maxPrice, minPrice, inStockOnly } = opts;
    return this.prisma.cachedProduct.findMany({
      where: this._buildSearchWhereOr(query, { maxPrice, minPrice, inStockOnly }),
      orderBy: [{ price: 'asc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async countSearchAllStoresOr(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean } = {},
  ): Promise<number> {
    return this.prisma.cachedProduct.count({
      where: this._buildSearchWhereOr(query, opts),
    });
  }

  private _buildSearchWhereOr(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean },
  ) {
    const { maxPrice, minPrice, inStockOnly } = opts;
    const priceFilter: Record<string, number> = {};
    if (minPrice != null) priceFilter.gte = minPrice;
    if (maxPrice != null) priceFilter.lte = maxPrice;

    // OR search: any word matches in any field
    const words = query.trim().split(/\s+/).filter(Boolean);
    const textOr = words.length
      ? words.flatMap((word) => [
          { title:       { contains: word, mode: 'insensitive' as const } },
          { description: { contains: word, mode: 'insensitive' as const } },
          { sku:         { contains: word, mode: 'insensitive' as const } },
          { tags:        { hasSome: [word.toLowerCase()] } },
        ])
      : [];

    return {
      active: true,
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
      ...(textOr.length ? { OR: textOr } : {}),
    };
  }

  async countSearchAllStores(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean } = {},
  ): Promise<number> {
    return this.prisma.cachedProduct.count({
      where: this._buildSearchWhere(query, opts),
    });
  }

  private _buildSearchWhere(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean },
  ) {
    const { maxPrice, minPrice, inStockOnly } = opts;

    // Build price filter
    const priceFilter: Record<string, number> = {};
    if (minPrice != null) priceFilter.gte = minPrice;
    if (maxPrice != null) priceFilter.lte = maxPrice;

    // Multi-word AND search:
    // Split "apple laptop" → ["apple", "laptop"] and require EVERY word to
    // appear somewhere across title, description, sku, or tags.
    // This means "apple laptop" matches "Apple MacBook Pro" if the product
    // is tagged "laptop" (or the description mentions it), even though neither
    // field contains the exact phrase "apple laptop".
    const words = query.trim().split(/\s+/).filter(Boolean);
    const textAnd = words.length
      ? words.map((word) => ({
          OR: [
            { title:       { contains: word, mode: 'insensitive' as const } },
            { description: { contains: word, mode: 'insensitive' as const } },
            { sku:         { contains: word, mode: 'insensitive' as const } },
            { tags:        { has: word.toLowerCase() } },
          ],
        }))
      : undefined;

    return {
      active: true,
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
      ...(textAnd ? { AND: textAnd } : {}),
    };
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
