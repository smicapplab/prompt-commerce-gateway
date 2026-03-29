import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { StorefrontService } from './storefront.service';

@Controller('api/storefront')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  @Get('stores')
  async listStores() {
    return this.storefrontService.listStores();
  }

  @Get('stores/:slug')
  async getStore(@Param('slug') slug: string) {
    return this.storefrontService.getStoreDetail(slug);
  }

  @Get('config')
  async getConfig() {
      return this.storefrontService.getConfig();
  }

  @Get('stores/:slug/categories')
  async getStoreCategories(@Param('slug') slug: string) {
      return this.storefrontService.getStoreCategories(slug);
  }

  @Get('stores/:slug/products')
  async getStoreProducts(
    @Param('slug') slug: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('sort') sort?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const categoryId = category ? parseInt(category, 10) : undefined;
    
    return this.storefrontService.getStoreProducts(slug, {
      categoryId: isNaN(categoryId as any) ? undefined : categoryId,
      search,
      page: isNaN(page) ? 1 : Math.max(1, page),
      limit: isNaN(limit) ? 20 : Math.max(1, Math.min(100, limit)),
      sort,
    });
  }

  @Get('stores/:slug/products/:sellerId')
  async getProduct(
      @Param('slug') slug: string, 
      @Param('sellerId', ParseIntPipe) sellerId: number
  ) {
      return this.storefrontService.getProduct(slug, sellerId);
  }

  @Get('search')
  async searchAcrossStores(
      @Query('q') q?: string,
      @Query('page') pageStr?: string,
      @Query('limit') limitStr?: string,
      @Query('min_price') minPriceStr?: string,
      @Query('max_price') maxPriceStr?: string,
      @Query('in_stock') inStockStr?: string,
  ) {
      const page = pageStr ? parseInt(pageStr, 10) : 1;
      const limit = limitStr ? parseInt(limitStr, 10) : 20;
      const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
      const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
      const inStockOnly = inStockStr === 'true';

      return this.storefrontService.searchCrossStore({
          q: q || '',
          page: isNaN(page) ? 1 : Math.max(1, page),
          limit: isNaN(limit) ? 20 : Math.max(1, Math.min(100, limit)),
          minPrice: isNaN(minPrice as any) ? undefined : minPrice,
          maxPrice: isNaN(maxPrice as any) ? undefined : maxPrice,
          inStockOnly,
      });
  }
}
