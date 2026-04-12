import {
  Controller, Get, Put, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

// SEC-E: Only these keys may be written via the admin API.
// This prevents a compromised JWT from overwriting sensitive runtime secrets
// such as telegram_bot_token or telegram_webhook_secret.
const MUTABLE_SETTINGS = new Set([
  'default_payment_provider',
  'default_payment_instructions',
  'default_payment_link_template',
  'default_payment_label',
  'default_currency',
  'telegram_webhook_url',
  'telegram_bot_token',
  'google_places_api_key',
  'google_places_browser_key',
  'gateway_ai_provider',
  'gateway_ai_api_key',
  'gateway_ai_model',
]);

@UseGuards(JwtAuthGuard)
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) { }

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
    if (!MUTABLE_SETTINGS.has(key)) {
      throw new BadRequestException(`Unknown or non-configurable setting key: "${key}"`);
    }
    await this.settings.set(key, body.value);
    return { key, value: body.value };
  }

  /** DELETE /api/settings/:key */
  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('key') key: string) {
    if (!MUTABLE_SETTINGS.has(key)) {
      throw new BadRequestException(`Unknown or non-configurable setting key: "${key}"`);
    }
    return this.settings.delete(key);
  }
}
