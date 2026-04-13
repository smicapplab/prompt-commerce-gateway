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
import { TaggingService } from './tagging.service';

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
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly tagging: TaggingService,
  ) {}

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

  // ── Search ───────────────────────────────────────────────────────────────

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

    // Strategy 1: Full-text search — fast, ranked, handles aiTags + title + description
    let { results, total } = await this._ftsSearch(parsed.keywords, filterOpts);

    // Strategy 2: Trigram fuzzy fallback — brand names, typos, short keywords
    let fallback = false;
    if (total === 0 && parsed.keywords.trim()) {
      ({ results, total } = await this._trgmSearch(parsed.keywords, filterOpts));
      if (total > 0) fallback = true;
    }

    return { results, total, parsed, fallback };
  }

  private async _ftsSearch(
    keywords: string,
    opts: { limit?: number; offset?: number; maxPrice?: number; minPrice?: number; inStockOnly?: boolean; storeSlug?: string },
  ): Promise<{ results: any[]; total: number }> {
    const { limit = 20, offset = 0, maxPrice, minPrice, inStockOnly, storeSlug } = opts;

    if (!keywords.trim()) return { results: [], total: 0 };

    const storeFilter    = storeSlug  != null ? Prisma.sql`AND store_slug = ${storeSlug}` : Prisma.sql``;
    const priceMinFilter = minPrice   != null ? Prisma.sql`AND price >= ${minPrice}`       : Prisma.sql``;
    const priceMaxFilter = maxPrice   != null ? Prisma.sql`AND price <= ${maxPrice}`       : Prisma.sql``;
    const stockFilter    = inStockOnly        ? Prisma.sql`AND stock_quantity > 0`         : Prisma.sql``;

    const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        id,
        store_slug     AS "storeSlug",
        seller_id      AS "sellerId",
        title,
        description,
        sku,
        price,
        stock_quantity AS "stockQuantity",
        category_id    AS "categoryId",
        tags,
        ai_tags        AS "aiTags",
        images,
        active,
        synced_at      AS "syncedAt"
      FROM cached_products
      WHERE active = true
        ${storeFilter}
        ${priceMinFilter}
        ${priceMaxFilter}
        ${stockFilter}
        AND search_vector @@ websearch_to_tsquery('english', ${keywords})
      ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', ${keywords})) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) AS count
      FROM cached_products
      WHERE active = true
        ${storeFilter}
        ${priceMinFilter}
        ${priceMaxFilter}
        ${stockFilter}
        AND search_vector @@ websearch_to_tsquery('english', ${keywords})
    `;

    return { results, total: Number(countResult[0].count) };
  }

  private async _trgmSearch(
    keywords: string,
    opts: { limit?: number; offset?: number; maxPrice?: number; minPrice?: number; inStockOnly?: boolean; storeSlug?: string },
  ): Promise<{ results: any[]; total: number }> {
    const { limit = 20, offset = 0, maxPrice, minPrice, inStockOnly, storeSlug } = opts;

    if (!keywords.trim()) return { results: [], total: 0 };

    const storeFilter    = storeSlug  != null ? Prisma.sql`AND store_slug = ${storeSlug}` : Prisma.sql``;
    const priceMinFilter = minPrice   != null ? Prisma.sql`AND price >= ${minPrice}`       : Prisma.sql``;
    const priceMaxFilter = maxPrice   != null ? Prisma.sql`AND price <= ${maxPrice}`       : Prisma.sql``;
    const stockFilter    = inStockOnly        ? Prisma.sql`AND stock_quantity > 0`         : Prisma.sql``;
    const likePattern    = `%${keywords}%`;

    const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        id,
        store_slug     AS "storeSlug",
        seller_id      AS "sellerId",
        title,
        description,
        sku,
        price,
        stock_quantity AS "stockQuantity",
        category_id    AS "categoryId",
        tags,
        ai_tags        AS "aiTags",
        images,
        active,
        synced_at      AS "syncedAt"
      FROM cached_products
      WHERE active = true
        ${storeFilter}
        ${priceMinFilter}
        ${priceMaxFilter}
        ${stockFilter}
        AND (
          title ILIKE ${likePattern}
          OR word_similarity(${keywords}, title) > 0.2
          OR EXISTS (
            SELECT 1 FROM unnest(ai_tags) AS t WHERE t ILIKE ${likePattern}
          )
        )
      ORDER BY word_similarity(${keywords}, title) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) AS count
      FROM cached_products
      WHERE active = true
        ${storeFilter}
        ${priceMinFilter}
        ${priceMaxFilter}
        ${stockFilter}
        AND (
          title ILIKE ${likePattern}
          OR word_similarity(${keywords}, title) > 0.2
          OR EXISTS (
            SELECT 1 FROM unnest(ai_tags) AS t WHERE t ILIKE ${likePattern}
          )
        )
    `;

    return { results, total: Number(countResult[0].count) };
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
            { aiTags:      { has: word.toLowerCase() } },
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

  async getAiTags(storeSlug: string) {
    return this.prisma.cachedProduct.findMany({
      where: { storeSlug },
      select: {
        sellerId: true,
        title: true,
        aiTags: true,
      },
      orderBy: { title: 'asc' },
    });
  }

  async getAiTagStats(storeSlug: string): Promise<{ total: number; tagged: number }> {
    const [total, tagged] = await Promise.all([
      this.prisma.cachedProduct.count({ where: { storeSlug } }),
      this.prisma.cachedProduct.count({ where: { storeSlug, NOT: { aiTags: { equals: [] } } } }),
    ]);
    return { total, tagged };
  }

  // ── Delta Sync ───────────────────────────────────────────────────────────
  async delta(slug: string, payload: DeltaPayload) {
    const result = await this.prisma.$transaction(async (tx) => {
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

    // Non-blocking: generate AI tags for upserted products after sync succeeds
    const upserted = payload.upsert?.products;
    if (upserted?.length) {
      // Fetch gateway IDs for the upserted seller IDs (needed for update by PK)
      this.prisma.cachedProduct.findMany({
        where: { storeSlug: slug, sellerId: { in: upserted.map(p => p.id) } },
        select: { id: true, title: true, description: true, tags: true },
      }).then(rows => this.tagging.generateAndSave(slug, rows))
        .catch(() => {/* already logged inside TaggingService */});
    }

    return result;
  }

  // ── Full Snapshot Sync (Legacy) ──────────────────────────────────────────
  async fullSnapshot(slug: string, categories: SyncCategoryDto[], products: SyncProductDto[]) {
    const result = await this.prisma.$transaction(async (tx) => {
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

    // Non-blocking: generate AI tags for all synced products
    if (products.length) {
      this.prisma.cachedProduct.findMany({
        where: { storeSlug: slug },
        select: { id: true, title: true, description: true, tags: true },
      }).then(rows => this.tagging.generateAndSave(slug, rows))
        .catch(() => {/* already logged inside TaggingService */});
    }

    return result;
  }
}
