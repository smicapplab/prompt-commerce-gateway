import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface InteractiveMessage {
  type: 'button' | 'list';
  header?: {
    type: 'text' | 'image';
    text?: string;
    image?: { link: string };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
    button?: string; // used for lists as the call to action
    sections?: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  };
}

@Injectable()
export class WhatsAppClient {
  private readonly logger = new Logger(WhatsAppClient.name);
  private phoneNumberId = '';
  private accessToken = '';
  private webhookSecret = '';

  setConfig(phoneNumberId: string, accessToken: string, webhookSecret: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.webhookSecret = webhookSecret;
  }

  isConfigured(): boolean {
    return !!(this.phoneNumberId && this.accessToken);
  }

  isConfiguredWithSecret(): boolean {
    return !!(this.phoneNumberId && this.accessToken && this.webhookSecret);
  }

  verifySignature(payload: string, signatureHeader?: string): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;
    
    // signature is "sha256=<hash>"
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    const expectedHeader = `sha256=${expectedSig}`;
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader),
        Buffer.from(expectedHeader)
      );
    } catch {
      return false;
    }
  }

  private async fetchApi(endpoint: string, data: any): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('WhatsAppClient is not configured');
    }

    const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // @ts-ignore - AbortSignal.timeout is a recent Node.js feature
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`WhatsApp API Error [${response.status}]: ${errText}`);
      throw new Error(`WhatsApp API failed: ${response.statusText}`);
    }

    return response.json();
  }

  async sendText(to: string, body: string, previewUrl = false): Promise<void> {
    await this.fetchApi('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body,
        preview_url: previewUrl,
      },
    });
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<void> {
    await this.fetchApi('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    });
  }

  async sendInteractive(to: string, message: InteractiveMessage): Promise<void> {
    await this.fetchApi('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: message,
    });
  }

  async markRead(messageId: string): Promise<void> {
    await this.fetchApi('messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
  }
}
