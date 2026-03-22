import {
  Controller, Get, Put, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

@UseGuards(JwtAuthGuard)
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** GET /api/settings — list all settings (values included) */
  @Get()
  list() {
    return this.settings.list();
  }

  /** GET /api/settings/:key */
  @Get(':key')
  async get(@Param('key') key: string) {
    const value = await this.settings.get(key);
    return { key, value };
  }

  /** PUT /api/settings/:key  body: { value: string } */
  @Put(':key')
  async set(@Param('key') key: string, @Body() body: { value: string }) {
    await this.settings.set(key, body.value);
    return { key, value: body.value };
  }

  /** DELETE /api/settings/:key */
  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('key') key: string) {
    return this.settings.delete(key);
  }
}
