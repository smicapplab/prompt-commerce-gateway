import {
  Controller, Post, Get, Param, Query, Body, Headers,
  UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrdersService } from './orders.service';
import { KeysService } from '../keys/keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ── BUG-3: Typed DTO for orders sync to replace `any` ─────────────────────────
class OrderSyncDto {
  @IsOptional()
  @IsArray()
  orders?: unknown[];

  @IsOptional()
  @IsArray()
  orderNotes?: unknown[];

  @IsOptional()
  @IsArray()
  orderFiles?: unknown[];
}

class OrderSyncPayloadDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSyncDto)
  upsert?: OrderSyncDto;
}

@Controller('api')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly keys: KeysService,
  ) {}

  @Post('stores/:slug/orders/sync')
  async sync(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() payload: OrderSyncPayloadDto,
  ) {
    if (!platformKey) throw new UnauthorizedException('Missing platform key.');
    const valid = await this.keys.validateKey(platformKey);
    if (!valid || valid.slug !== slug) {
      throw new UnauthorizedException('Invalid platform key.');
    }

    return this.ordersService.sync(slug, payload as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async list(
    @Query('store') store?: string,
    @Query('status') status?: string,
    @Query('deliveryType') deliveryType?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    // BUG-4: Guard against NaN, zero, or negative pagination values
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
    return this.ordersService.list({
      store,
      status,
      deliveryType,
      page: pageNum,
      limit: limitNum,
    });
  }
}
