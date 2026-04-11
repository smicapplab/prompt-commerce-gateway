import { Injectable, Inject } from '@nestjs/common';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  ValidateNested, 
  IsInt 
} from 'class-validator';
import { Type } from 'class-transformer';
import { PRISMA } from '../prisma/prisma.module';
import { Prisma, PrismaClient } from '@prisma/client';
import { parseSearchQuery } from './parse-search-query';

export class SyncCategoryDto {
  @IsInt()
  id!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @IsOptional()
  parent_id!: number | null;
}

export class SyncProductDto {
  @IsInt()
  id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description!: string | null;

  @IsString()
  @IsOptional()
  sku!: string | null;

  @IsNumber()
  @IsOptional()
  price!: number | null;

  @IsInt()
  stock_quantity!: number;

  @IsInt()
  @IsOptional()
  category_id!: number | null;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsBoolean()
  active!: boolean;
}

export class DeltaPayloadUpsert {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SyncCategoryDto)
  categories?: SyncCategoryDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SyncProductDto)
  products?:   SyncProductDto[];
}

export class DeltaPayloadDelete {
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  productIds?:  number[];
}

export class DeltaPayload {
  @IsOptional()
  @ValidateNested()
  @Type(() => DeltaPayloadUpsert)
  upsert?: DeltaPayloadUpsert;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeltaPayloadDelete)
  delete?: DeltaPayloadDelete;
}

@Injectable()
export class CatalogService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getCategories(storeSlug: string) {
    return this.prisma.cachedCategory.findMany({
      where: { storeSlug },
      orderBy: { name: 'asc' },
    });
  }

  async getProducts(
    storeSlug: string,
    opts: { categoryId?: number; search?: string; limit?: number; offset?: number; sort?: string } = {},
  ) {
    const { categoryId, search, limit = 20, offset = 0, sort } = opts;
    const where = this._buildProductsWhere(storeSlug, { categoryId, search });

    let orderBy: Prisma.CachedProductOrderByWithRelationInput = { title: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { syncedAt: 'desc' };

    return this.prisma.cachedProduct.findMany({
      where,
      orderBy,
      take:    limit,
      skip:    offset,
    });
  }

  async countProducts(
    storeSlug: string,
    opts: { categoryId?: number; search?: string } = {},
  ): Promise<number> {
    const where = this._buildProductsWhere(storeSlug, opts);
    return this.prisma.cachedProduct.count({ where });
  }

  private _buildProductsWhere(storeSlug: string, opts: { categoryId?: number; search?: string }): Prisma.CachedProductWhereInput {
    const { categoryId, search } = opts;
    let where: Prisma.CachedProductWhereInput = { storeSlug, active: true };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (search) {
      const parsed = parseSearchQuery(search);
      const searchWhere = this._buildSearchWhere(parsed.keywords, {
        maxPrice: parsed.maxPrice,
        minPrice: parsed.minPrice,
        inStockOnly: parsed.inStockOnly,
      });
      // Merge searchWhere into where
      where = { ...where, ...searchWhere };
    }
    return where;
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
      storeSlug?:   string;
    } = {},
  ) {
    const { limit = 20, offset = 0, maxPrice, minPrice, inStockOnly, storeSlug } = opts;
    return this.prisma.cachedProduct.findMany({
      where: this._buildSearchWhere(query, { maxPrice, minPrice, inStockOnly, storeSlug }),
      orderBy: [{ price: 'asc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async countSearchAllStores(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean; storeSlug?: string } = {},
  ): Promise<number> {
    return this.prisma.cachedProduct.count({
      where: this._buildSearchWhere(query, opts),
    });
  }

  async smartSearch(rawQuery: string, opts: { limit?: number; offset?: number; storeSlug?: string } = {}) {
    const parsed = parseSearchQuery(rawQuery || '');
    const filterOpts = {
      limit: opts.limit,
      offset: opts.offset,
      maxPrice: parsed.maxPrice,
      minPrice: parsed.minPrice,
      inStockOnly: parsed.inStockOnly,
      storeSlug: opts.storeSlug,
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
      storeSlug?:   string;
    } = {},
  ) {
    const { limit = 20, offset = 0, maxPrice, minPrice, inStockOnly, storeSlug } = opts;
    return this.prisma.cachedProduct.findMany({
      where: this._buildSearchWhereOr(query, { maxPrice, minPrice, inStockOnly, storeSlug }),
      orderBy: [{ price: 'asc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async countSearchAllStoresOr(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean; storeSlug?: string } = {},
  ): Promise<number> {
    return this.prisma.cachedProduct.count({
      where: this._buildSearchWhereOr(query, opts),
    });
  }

  private _buildSearchWhereOr(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean; storeSlug?: string },
  ) {
    const { maxPrice, minPrice, inStockOnly, storeSlug } = opts;
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
      storeSlug: storeSlug || undefined,
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
      ...(textOr.length ? { OR: textOr } : {}),
    };
  }

  private _buildSearchWhere(
    query: string,
    opts: { maxPrice?: number; minPrice?: number; inStockOnly?: boolean; storeSlug?: string },
  ) {
    const { maxPrice, minPrice, inStockOnly, storeSlug } = opts;

    // Build price filter
    const priceFilter: Record<string, number> = {};
    if (minPrice != null) priceFilter.gte = minPrice;
    if (maxPrice != null) priceFilter.lte = maxPrice;

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
      storeSlug: storeSlug || undefined,
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
      ...(textAnd ? { AND: textAnd } : {}),
    };
  }

  async getProduct(storeSlug: string, sellerId: number) {
    return this.prisma.cachedProduct.findUnique({
      where: { storeSlug_sellerId: { storeSlug, sellerId } },
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

  // ── Delta Sync ───────────────────────────────────────────────────────────
  async delta(slug: string, payload: DeltaPayload) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Categories
      if (payload.delete?.categoryIds?.length) {
        await tx.cachedCategory.deleteMany({
          where: { storeSlug: slug, sellerId: { in: payload.delete.categoryIds } },
        });
      }
      for (const cat of payload.upsert?.categories ?? []) {
        await tx.cachedCategory.upsert({
          where: { storeSlug_sellerId: { storeSlug: slug, sellerId: cat.id } },
          create: { storeSlug: slug, sellerId: cat.id, name: cat.name, parentId: cat.parent_id },
          update: { name: cat.name, parentId: cat.parent_id, syncedAt: new Date() },
        });
      }

      // 2. Products
      if (payload.delete?.productIds?.length) {
        await tx.cachedProduct.deleteMany({
          where: { storeSlug: slug, sellerId: { in: payload.delete.productIds } },
        });
      }
      for (const p of payload.upsert?.products ?? []) {
        await tx.cachedProduct.upsert({
          where: { storeSlug_sellerId: { storeSlug: slug, sellerId: p.id } },
          create: {
            storeSlug: slug,
            sellerId: p.id,
            title: p.title,
            description: p.description,
            sku: p.sku,
            price: p.price,
            stockQuantity: p.stock_quantity,
            categoryId: p.category_id,
            tags: p.tags,
            images: p.images,
            active: p.active,
          },
          update: {
            title: p.title,
            description: p.description,
            sku: p.sku,
            price: p.price,
            stockQuantity: p.stock_quantity,
            categoryId: p.category_id,
            tags: p.tags,
            images: p.images,
            active: p.active,
            syncedAt: new Date(),
          },
        });
      }

      return {
        categories: (payload.upsert?.categories?.length ?? 0) + (payload.delete?.categoryIds?.length ?? 0),
        products:   (payload.upsert?.products?.length   ?? 0) + (payload.delete?.productIds?.length   ?? 0),
      };
    });
  }

  // ── Full Snapshot Sync (Legacy) ──────────────────────────────────────────
  async fullSnapshot(slug: string, categories: SyncCategoryDto[], products: SyncProductDto[]) {
    return this.prisma.$transaction(async (tx) => {
      // Wipe existing
      await tx.cachedProduct.deleteMany({ where: { storeSlug: slug } });
      await tx.cachedCategory.deleteMany({ where: { storeSlug: slug } });

      // Re-insert
      if (categories.length > 0) {
        await tx.cachedCategory.createMany({
          data: categories.map(cat => ({
            storeSlug: slug,
            sellerId: cat.id,
            name: cat.name,
            parentId: cat.parent_id,
          })),
        });
      }

      if (products.length > 0) {
        await tx.cachedProduct.createMany({
          data: products.map(p => ({
            storeSlug: slug,
            sellerId: p.id,
            title: p.title,
            description: p.description,
            sku: p.sku,
            price: p.price,
            stockQuantity: p.stock_quantity,
            categoryId: p.category_id,
            tags: p.tags,
            images: p.images,
            active: p.active,
          })),
        });
      }

      return { categories: categories.length, products: products.length };
    });
  }
}
