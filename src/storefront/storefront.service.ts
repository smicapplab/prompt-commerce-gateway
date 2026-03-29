import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { CatalogService } from '../catalog/catalog.service';
import { parseSearchQuery } from '../catalog/parse-search-query';

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

    const [products, total, store] = await Promise.all([
      this.catalogService.getProducts(slug, { categoryId, search, sort, limit, offset }),
      this.catalogService.countProducts(slug, { categoryId, search }),
      this.prisma.retailer.findUnique({ where: { slug }, select: { mcpServerUrl: true } }),
    ]);

    let baseUrl = '';
    if (store?.mcpServerUrl) {
       try { baseUrl = new URL(store.mcpServerUrl).origin; } catch {}
    }

    return {
      products: products.map(p => this._formatImages(p, baseUrl)),
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

      const store = await this.prisma.retailer.findUnique({ where: { slug }, select: { mcpServerUrl: true } });
      let baseUrl = '';
      if (store?.mcpServerUrl) {
          try { baseUrl = new URL(store.mcpServerUrl).origin; } catch {}
      }

      return this._formatImages(product, baseUrl);
  }

  async searchCrossStore(opts: { q: string; page?: number; limit?: number; minPrice?: number; maxPrice?: number; inStockOnly?: boolean }) {
      const { q, page = 1, limit = 20, minPrice, maxPrice, inStockOnly } = opts;
      const offset = (page - 1) * limit;
      
      const parsed = parseSearchQuery(q || '');

      const filterOpts = { 
        limit, 
        offset, 
        minPrice: minPrice ?? parsed.minPrice, 
        maxPrice: maxPrice ?? parsed.maxPrice, 
        inStockOnly: inStockOnly || parsed.inStockOnly 
      };

      const [products, total] = await Promise.all([
          this.catalogService.searchAllStores(parsed.keywords, filterOpts),
          this.catalogService.countSearchAllStores(parsed.keywords, filterOpts)
      ]);

      const storeSlugs = [...new Set(products.map(p => p.storeSlug))];
      const stores = await this.prisma.retailer.findMany({
          where: { slug: { in: storeSlugs } },
          select: { slug: true, mcpServerUrl: true }
      });
      const urlMap = new Map<string, string>();
      for (const s of stores) {
          try { urlMap.set(s.slug, new URL(s.mcpServerUrl).origin); } catch { urlMap.set(s.slug, ''); }
      }

      return {
          products: products.map(p => this._formatImages(p, urlMap.get(p.storeSlug) || '')),
          pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              hasMore: offset + limit < total
          }
      };
  }

  private _formatImages<T extends { images?: string[] | null }>(product: T, baseUrl: string): T {
      if (!product || !baseUrl || !product.images) return product;
      return {
          ...product,
          images: product.images.map(img => img.startsWith('/uploads/') ? `${baseUrl}${img}` : img),
      };
  }
}
