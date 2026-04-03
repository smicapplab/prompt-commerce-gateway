import { Controller, Post, Get, Param, Query, Body, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { KeysService } from '../keys/keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    @Body() payload: any,
  ) {
    if (!platformKey) throw new UnauthorizedException('Missing platform key.');
    const valid = await this.keys.validateKey(platformKey);
    if (!valid || valid.slug !== slug) {
      throw new UnauthorizedException('Invalid platform key.');
    }

    return this.ordersService.sync(slug, payload);
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
    return this.ordersService.list({
      store,
      status,
      deliveryType,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }
}
