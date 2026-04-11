import { Injectable, Logger, Inject } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';
import { CatalogService } from '../catalog/catalog.service';
import { RegistryService } from '../registry/registry.service';
import { CatalogFormatter } from '../catalog/catalog-formatter';

@Injectable()
export class BrowsingService {
  private readonly logger = new Logger(BrowsingService.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly catalog: CatalogService,
    private readonly registry: RegistryService,
    private readonly catalogFormatter: CatalogFormatter,
  ) {}

  /**
   * Resolves a product's first image URL into an absolute URL
   * using the store's MCP server base URL if it's a relative path.
   */
  async resolveImageUrl(product: any, storeSlug: string): Promise<string | undefined> {
    const images = Array.isArray(product.images) ? product.images : [];
    let imageUrl = images[0] as string | undefined;

    if (!imageUrl) return undefined;

    // If it's already an absolute URL, return it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Otherwise, build an absolute URL using the store's MCP server base URL
    try {
      const retailer = await this.registry.findBySlug(storeSlug);
      if (!retailer || !retailer.mcpServerUrl) return undefined;
      
      const base = retailer.mcpServerUrl.replace(/\/sse\/?$/, '').replace(/\/$/, '');
      return `${base}/uploads/${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
    } catch {
      return undefined;
    }
  }

  async getCategories(slug: string) {
    return await this.catalog.getCategories(slug);
  }

  async getProductsByCategory(slug: string, catId: number | 'all', options: { limit?: number; offset?: number } = {}) {
    if (catId === 'all') {
      return await this.catalog.getProducts(slug, { limit: options.limit, offset: options.offset });
    }
    return await this.catalog.getProducts(slug, { categoryId: catId, limit: options.limit, offset: options.offset });
  }

  async getProductDetail(slug: string, productId: number) {
    return await this.prisma.cachedProduct.findUnique({
      where: { storeSlug_sellerId: { storeSlug: slug, sellerId: productId } }
    });
  }

  async smartSearch(query: string, options: { limit?: number; offset?: number; storeSlug?: string } = {}) {
    return await this.catalog.smartSearch(query, options);
  }
}
