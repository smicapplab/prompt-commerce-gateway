import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger, BadRequestException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { Response } from 'express';
import { AddressPickerService, StructuredAddress } from './address-picker.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SettingsService } from '../settings/settings.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('address-picker')
export class AddressPickerController implements OnModuleInit {
  private readonly logger = new Logger(AddressPickerController.name);
  private htmlTemplate: string = '';

  constructor(
    private readonly service: AddressPickerService,
    @Inject(forwardRef(() => WhatsAppService))
    private readonly whatsapp: WhatsAppService,
    private readonly settings: SettingsService,
  ) { }

  async onModuleInit() {
    // Cache the HTML template on startup to avoid blocking the event loop later
    const filePath = path.join(process.cwd(), 'public', 'address-picker.html');
    if (!fs.existsSync(filePath)) {
      this.logger.error(`Address picker HTML file not found at ${filePath}`);
      return;
    }
    try {
      this.htmlTemplate = fs.readFileSync(filePath, 'utf8');
      this.logger.log('Address picker template cached.');
    } catch (err) {
      this.logger.error(`Failed to read address picker template: ${err}`);
    }
  }

  @Get()
  async serveForm(@Query('token') token: string, @Res() res: Response) {
    const session = await this.service.validateToken(token);
    if (!session) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid or expired token');
    }

    if (!this.htmlTemplate) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Configuration error: template missing');
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || await this.settings.get('google_places_api_key');

    // Inject data into cached template
    const html = this.htmlTemplate
      .replace('__API_KEY__', apiKey || '')
      .replace('__TOKEN__', token)
      .replace('__CHANNEL__', session.channel);

    res.header('Content-Type', 'text/html').send(html);
  }

  @Post('submit')
  async submitAddress(@Body() body: { token: string; address?: StructuredAddress; cancelled?: boolean }) {
    const { token, address, cancelled } = body;

    // Atomic check-and-consume at the start to prevent double-submission or replay race conditions
    const session = await this.service.consumeToken(token);
    if (!session) {
      throw new BadRequestException('Invalid or expired token, or already submitted');
    }

    if (cancelled) {
      if (session.channel === 'whatsapp') {
        await this.whatsapp.handlePickerCancelled(session.userId, session.storeSlug);
      }
      return { success: true };
    }

    if (session.channel === 'whatsapp') {
      await this.whatsapp.handlePickerAddress(session.userId, session.storeSlug, address);
    }
    // Telegram is handled client-side via Telegram.WebApp.sendData()

    return { success: true };
  }
}
