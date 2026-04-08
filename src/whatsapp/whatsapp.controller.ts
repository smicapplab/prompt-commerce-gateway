import { Controller, Get, Post, Req, Res, Logger, HttpStatus, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { SettingsService } from '../settings/settings.service';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly settings: SettingsService,
    private readonly whatsappService: WhatsAppService,
  ) { }

  @Get('webhook')
  async verifyWebhook(@Req() req: Request, @Res() res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = (await this.settings.get('whatsapp_webhook_verify_token'))?.trim() ?? process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === expectedToken) {
      this.logger.log('Webhook verified successfully.');
      return res.status(HttpStatus.OK).send(challenge);
    }

    this.logger.warn('Webhook verification failed.');
    return res.status(HttpStatus.FORBIDDEN).send();
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['x-hub-signature-256'] as string;

    // We send OK immediately to avoid Meta retries if our processing takes time
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

    try {
      await this.whatsappService.handleWebhook(req.body, signature, (req as any).rawBody);
    } catch (err) {
      this.logger.error(`Error processing webhook: ${err}`);
    }
  }
}
