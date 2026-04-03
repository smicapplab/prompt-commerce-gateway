import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { RegistryService } from '../registry/registry.service';
import { TelegramService } from '../telegram/telegram.service';

export type SenderType = 'buyer' | 'ai' | 'human' | 'system';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly registry: RegistryService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegram: TelegramService,
  ) {}

  /** Find or create a conversation in gateway (PostgreSQL) and mirror to seller (SQLite) */
  async getOrCreate(buyerRef: string, buyerName: string | null, storeSlug: string) {
    let conv = await this.prisma.conversation.findUnique({
      where: {
        buyerRef_storeSlug_channel: {
          buyerRef,
          storeSlug,
          channel: 'telegram',
        },
      },
    });

    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: {
          buyerRef,
          buyerName,
          storeSlug,
          channel: 'telegram',
          mode: 'ai',
        },
      });
      this.logger.log(`Created new conversation ${conv.id} for ${buyerRef} at ${storeSlug}`);
    } else if (buyerName && conv.buyerName !== buyerName) {
      conv = await this.prisma.conversation.update({
        where: { id: conv.id },
        data: { buyerName },
      });
    }

    // Mirror to seller app (fire-and-forget)
    this.mirrorToSeller(storeSlug, 'POST', '/api/conversations', {
      buyer_ref: buyerRef,
      buyer_name: buyerName,
      channel: 'telegram',
      gateway_id: conv.id,
    }).catch(err => this.logger.error(`Failed to mirror conversation to seller: ${err.message}`));

    return conv;
  }

  /** Find a conversation by ID */
  async findById(id: number) {
    return this.prisma.conversation.findUnique({
      where: { id },
    });
  }

  /** Find a conversation by buyer_ref + slug */
  async findByBuyerRef(buyerRef: string, storeSlug: string, channel = 'telegram') {
    return this.prisma.conversation.findUnique({
      where: {
        buyerRef_storeSlug_channel: {
          buyerRef,
          storeSlug,
          channel,
        },
      },
    });
  }
  /** Update conversation mode (ai -> human) and assigned agent */
  async setMode(id: number, mode: 'ai' | 'human' | 'closed', assignedTo?: string, skipMirror = false, skipNotification = false) {
    const conv = await this.prisma.conversation.update({
      where: { id },
      data: { mode, assignedTo: assignedTo || null },
    });

    // Notify seller via Telegram if this is a handover to human (triggered by AI or Admin, not the seller itself)
    if (mode === 'human' && !skipNotification) {
      try {
        const retailer = await this.registry.findBySlug(conv.storeSlug);
        if (retailer.telegramNotifyChatId) {
          await this.telegram.sendMessage(retailer.telegramNotifyChatId, 
            `🔔 <b>Handover Request</b> — ${retailer.name}\n\n` +
            `A customer (${conv.buyerName || conv.buyerRef}) is requesting human assistance.\n` +
            `Respond via the seller admin panel inbox.`
          );
        }
      } catch (err: any) {
        this.logger.error(`Failed to notify seller of handover: ${err.message}`);
      }
    }

    if (skipMirror) return conv;

    // Mirror to seller app
    this.mirrorToSeller(conv.storeSlug, 'POST', `/api/conversations/lookup`, {
      buyer_ref: conv.buyerRef,
      channel: conv.channel
    })
    .then(async (sellerConv: any) => {
      if (sellerConv?.id) {
        return this.mirrorToSeller(conv.storeSlug, 'PATCH', `/api/conversations/${sellerConv.id}`, {
          mode,
          assigned_to: assignedTo,
        });
      }
    })
    .catch(err => this.logger.error(`Failed to mirror mode change to seller: ${err.message}`));

    return conv;
  }

  /** Send a message from the platform admin to the buyer and mirror to seller */
  async deliverFromAdmin(conversationId: number, body: string, senderName: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new Error('Conversation not found');

    // 1. Deliver to Telegram
    const escName = (senderName || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const prefix = escName ? `[${escName}]: ` : '';
    await this.telegram.sendMessage(conv.buyerRef, `${prefix}${body}`, { parse_mode: 'HTML' });

    // 2. Log and mirror (this handles both PostgreSQL and SQLite)
    return this.logMessage(conversationId, conv.storeSlug, 'human', body, senderName);
  }

  /** Log a message to gateway (PostgreSQL) and mirror to seller (SQLite) */
  async logMessage(conversationId: number, storeSlug: string, senderType: SenderType, body: string, senderName?: string, skipMirror = false) {
    const msg = await this.prisma.message.create({
      data: {
        conversationId,
        senderType,
        senderName: senderName || null,
        body,
      },
    });

    if (skipMirror) return msg;

    // Mirror to seller app (fire-and-forget)
    // We need the seller-side conversation ID. For simplicity, we use buyer_ref to find it on their side.
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (conv) {
      this.mirrorToSeller(storeSlug, 'POST', `/api/conversations/lookup`, {
        buyer_ref: conv.buyerRef,
        channel: 'telegram'
      })
      .then(async (sellerConv: any) => {
        if (sellerConv?.id) {
          return this.mirrorToSeller(storeSlug, 'POST', `/api/conversations/${sellerConv.id}/messages`, {
            sender: senderType,
            sender_name: senderName,
            body,
          });
        }
      })
      .catch(err => this.logger.error(`Failed to mirror message to seller: ${err.message}`));
    }

    return msg;
  }

  /** Internal helper to call seller app with gateway platform key */
  private async mirrorToSeller(slug: string, method: string, path: string, body: any, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        const retailer = await this.registry.findBySlug(slug);
        if (!retailer.platformKey) {
          throw new Error(`No platform key for retailer ${slug}`);
        }

        const url = `${retailer.mcpServerUrl}${path}?store=${slug}`;
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-gateway-key': retailer.platformKey.key,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Seller app returned ${res.status}: ${errBody}`);
        }

        return await res.json();
      } catch (err: any) {
        if (i === retries) {
          throw err;
        }
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
}
