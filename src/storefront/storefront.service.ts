import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class StorefrontService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly catalogService: CatalogService,
  ) {}

  async listStores() {
    // Only active & verified stores
    const stores = await this.prisma.retailer.findMany({
      where: { active: true, verified: true },
      select: {
        slug: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    const storeSlugs = stores.map(s => s.slug);
    
    const [productCounts, categoryCounts] = await Promise.all([
      this.prisma.cachedProduct.groupBy({
        by: ['storeSlug'],
        where: { storeSlug: { in: storeSlugs }, active: true },
        _count: true,
      }),
      this.prisma.cachedCategory.groupBy({
        by: ['storeSlug'],
        where: { storeSlug: { in: storeSlugs } },
        _count: true,
      })
    ]);

    const productsMap = new Map(productCounts.map(g => [g.storeSlug, g._count]));
    const categoriesMap = new Map(categoryCounts.map(g => [g.storeSlug, g._count]));

    return stores.map(store => ({
      ...store,
      productCount: productsMap.get(store.slug) || 0,
      categoryCount: categoriesMap.get(store.slug) || 0,
    }));
  }

  async getStoreDetail(slug: string) {
    const store = await this.prisma.retailer.findFirst({
      where: { slug, active: true, verified: true },
      select: { slug: true, name: true }
    });
    if (!store) throw new NotFoundException('Store not found');

    const productCount = await this.prisma.cachedProduct.count({
        where: { storeSlug: slug, active: true },
    });
    const categoryCount = await this.prisma.cachedCategory.count({
        where: { storeSlug: slug },
    });

    return {
        ...store,
        productCount,
        categoryCount
    };
  }

  async getStoreProducts(slug: string, opts: { categoryId?: number; search?: string; page?: number; limit?: number; sort?: string }) {
    const { categoryId, search, page = 1, limit = 20, sort } = opts;
    const offset = (page - 1) * limit;

    const where: any = {
      storeSlug: slug,
      active: true,
    };
    if (categoryId != null) where.categoryId = categoryId;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    let orderBy: any = { title: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { syncedAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.cachedProduct.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      this.prisma.cachedProduct.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      }
    };
  }

  async getStoreCategories(slug: string) {
      return this.catalogService.getCategories(slug);
  }

  async getProduct(slug: string, sellerId: number) {
      const product = await this.catalogService.getProduct(slug, sellerId);
      if (!product || !product.active) throw new NotFoundException('Product not found');
      return product;
  }

  async searchCrossStore(opts: { q: string; page?: number; limit?: number; minPrice?: number; maxPrice?: number; inStockOnly?: boolean }) {
      const { q, page = 1, limit = 20, minPrice, maxPrice, inStockOnly } = opts;
      const offset = (page - 1) * limit;
      
      const filterOpts = { limit, offset, minPrice, maxPrice, inStockOnly };
      const [products, total] = await Promise.all([
          this.catalogService.searchAllStores(q, filterOpts),
          this.catalogService.countSearchAllStores(q, filterOpts)
      ]);

      return {
          products,
          pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              hasMore: offset + limit < total
          }
      };
  }
}
