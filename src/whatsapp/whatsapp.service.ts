import { Injectable, OnModuleInit, Logger, Inject, Optional, forwardRef } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';
import { RegistryService } from '../registry/registry.service';
import { SettingsService } from '../settings/settings.service';
import { CatalogService } from '../catalog/catalog.service';
import { AiChatService } from '../telegram/ai-chat.service';
import { BrowsingService } from '../bot/browsing.service';
import { CheckoutService } from '../bot/checkout.service';
import { CheckoutState } from '../shared/types';
import { buildAiChatFooter } from '../shared/ai-chat-shell';
import { CartService } from '../cart/cart.service';
import { AddressPickerService } from '../address-picker/address-picker.service';
import { ConversationService } from '../chat/conversation.service';
import { PaymentService } from '../payments/payment.service';
import { WhatsAppClient } from './whatsapp-client';
import { WhatsAppSessionService } from './whatsapp-session.service';
import { CatalogFormatter } from '../catalog/catalog-formatter';
import { callRetailerTool } from '../mcp/retailer-client';
import {
  buildStoreListMenu,
  buildStoreMainMenu,
  buildSearchResultButtons,
  buildProductDetailButtons,
  buildQuantityMenu,
  buildDeliveryMenu,
  buildLabelMenu,
  buildCartMenu,
  buildCategoryListMenu,
  buildAddressSelectMenu,
  buildPaymentMenu,
  buildProductCard,
  buildSearchNavigation,
  WA_ACTION
} from './whatsapp-menu.builder';

interface PlatformSession {
  storeSlug?: string;
  // Used for tracking standard vs setup flow context
}

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly registry: RegistryService,
    private readonly settings: SettingsService,
    private readonly catalog: CatalogService,
    @Inject(forwardRef(() => AiChatService)) private readonly aiChat: AiChatService,
    @Inject(forwardRef(() => CartService)) private readonly cartService: CartService,
    private readonly conversationService: ConversationService,
    private readonly addressPicker: AddressPickerService,
    private readonly client: WhatsAppClient,
    private readonly sessionService: WhatsAppSessionService,
    private readonly catalogFormatter: CatalogFormatter,
    private readonly browsing: BrowsingService,
    private readonly checkout: CheckoutService,
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Optional() private readonly paymentService?: PaymentService,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.initClient();
  }

  async initClient(): Promise<void> {
    const phoneNumberId = (await this.settings.get('whatsapp_phone_number_id'))?.trim() ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = (await this.settings.get('whatsapp_access_token'))?.trim() ?? process.env.WHATSAPP_ACCESS_TOKEN;
    const webhookSecret = (await this.settings.get('whatsapp_webhook_secret'))?.trim() ?? process.env.WHATSAPP_WEBHOOK_SECRET ?? process.env.WHATSAPP_APP_SECRET;

    if (phoneNumberId && accessToken && (webhookSecret || process.env.NODE_ENV === 'development')) {
      this.client.setConfig(phoneNumberId, accessToken, webhookSecret || '');
      this.logger.log('WhatsAppClient configured.');
    } else {
      this.logger.warn('WhatsApp configuration incomplete. Bot is disabled.');
    }
  }

  async handleWebhook(payload: any, signature: string, rawBodyBuffer?: Buffer): Promise<void> {
    if (!this.client.isConfigured()) return;

    // Verify Meta signature to reject spoofed/tampered webhooks
    const rawBody = rawBodyBuffer ? rawBodyBuffer.toString('utf8') : (typeof payload === 'string' ? payload : JSON.stringify(payload));

    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && (!signature || !this.client.verifySignature(rawBody, signature))) {
      this.logger.warn('Missing or invalid webhook signature — request rejected.');
      return;
    }

    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.value && change.value.messages) {
          const messages = change.value.messages;
          const contacts = change.value.contacts || [];

          for (const msg of messages) {
            const waId = msg.from;
            const name = contacts.find((c: any) => c.wa_id === waId)?.profile?.name || 'Customer';
            const messageId = msg.id;

            // Mark message as read
            await this.client.markRead(messageId).catch(err => this.logger.warn(`Failed to mark read: ${err}`));

            await this.syncUser(waId, name);

            if (msg.type === 'text') {
              const text = msg.text.body;
              await this.routeMessage(waId, name, text, messageId);
            } else if (msg.type === 'interactive') {
              const interactiveType = msg.interactive.type;
              let buttonId = '';
              if (interactiveType === 'button_reply') {
                buttonId = msg.interactive.button_reply.id;
              } else if (interactiveType === 'list_reply') {
                buttonId = msg.interactive.list_reply.id;
              }
              if (buttonId) {
                await this.routeInteractive(waId, buttonId);
              }
            }
          }
        }
      }
    }
  }

  private async syncUser(waId: string, name: string): Promise<void> {
    try {
      await this.prisma.whatsAppUser.upsert({
        where: { id: waId },
        create: { id: waId, displayName: name },
        update: { displayName: name },
      });
    } catch (err) {
      this.logger.error(`User sync failed for ${waId}: ${err}`);
    }
  }

  /**
   * Sends product search results as individual WhatsApp card messages (image + title + price +
   * buttons), matching the Telegram card UX.  Follows up with a navigation/pagination footer.
   */
  private async sendSearchCards(
    waId: string,
    products: any[],
    storeSlug: string,
    opts: { query?: string; page?: number; totalPages?: number; totalResults?: number; cartCount?: number } = {},
  ): Promise<void> {
    const { page = 1, totalPages = 1, cartCount = 0 } = opts;

    const cartUserId = `wa:${waId}`;
    for (const product of products) {
      const imageUrl = await this.browsing.resolveImageUrl(product, storeSlug);
      const itemQty  = await this.cartService.getItemQty(cartUserId, storeSlug, product.sellerId ?? product.id).catch(() => 0);
      const card = buildProductCard(product, storeSlug, itemQty, {
        imageUrl,
        pageInfo: products.length > 1 ? `Result ${products.indexOf(product) + 1} of ${opts.totalResults ?? products.length}` : undefined,
      });
      await this.client.sendInteractive(waId, card);
    }

    const nav = buildSearchNavigation(storeSlug, page, totalPages, cartCount);
    if (nav) {
      await this.client.sendInteractive(waId, nav);
    }
  }

  private async routeMessage(waId: string, name: string, text: string, messageId: string, page = 1) {
    this.logger.log(`Received text message from ${waId}: ${text} (page ${page})`);
    const cartUserId = `wa:${waId}`;

    const session = await this.sessionService.getSession<any>(waId, 'main');

    // ── Gap 3c: Human Handover Keyword Detection ────────────────────────────
    const HUMAN_KEYWORDS = ['/human', 'talk to agent', 'human please', 'speak to person', 'real person', 'live agent'];
    const wantsHuman = HUMAN_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

    if (wantsHuman && session?.storeSlug) {
      const conv = await this.conversationService.getOrCreate(String(waId), name || 'Buyer', session.storeSlug, 'whatsapp');
      await this.conversationService.setMode(conv.id, 'human');
      await this.client.sendText(waId, `👤 Connecting you to a human agent. Please hold on — someone will be with you shortly.\n\nType "exit" at any time to leave AI chat.`);
      return;
    }

    // Command overrides and Greetings
    const GREETINGS = ['/start', 'menu', 'hi', 'hello', 'hey', 'hello there', 'good morning', 'good afternoon', 'good evening', 'uy', 'oi'];
    const lowerText = text.trim().toLowerCase();
    const isGreeting = GREETINGS.includes(lowerText);
    const isShortUnknown = !session?.step && text.trim().split(/\s+/).length <= 3;

    if (isGreeting || (!session && isShortUnknown)) {
      const activeRetailers = await this.registry.findActiveRetailers();
      if (activeRetailers.length === 0) {
        return this.client.sendText(waId, 'No stores are currently active.');
      } else if (activeRetailers.length === 1) {
        // Auto-select single store
        const store = activeRetailers[0];
        await this.sessionService.setSession(waId, 'main', { storeSlug: store.slug });
        return this.showStoreMainMenu(waId, store.slug, session);
      } else {
        await this.sessionService.deleteSession(waId, 'main');
        const storeMap = activeRetailers.map(r => ({ slug: r.slug, name: r.name }));
        const message = isGreeting ? 'Welcome! Please select a store below.' : 'I didn\'t quite catch that, but here are our available stores:';
        return this.client.sendInteractive(waId, {
          ...buildStoreListMenu(storeMap),
          body: { text: message }
        });
      }
    }
    
    // ── Unified Logging: Log buyer message ──
    if (session?.storeSlug) {
      try {
        const conv = await this.conversationService.getOrCreate(String(waId), name || 'Buyer', session.storeSlug, 'whatsapp');
        await this.conversationService.logMessage(conv.id, session.storeSlug, 'buyer', text, undefined, false, conv);
      } catch (err) {
        this.logger.error(`Failed to log message: ${err}`);
      }
    }

    // ─── Checkout Flow Steps (routeMessage) ──────────────────────────────────
    if (session?.step === 'collect:name') {
      const names = text.trim().split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || 'User';
      
      await this.prisma.whatsAppUser.update({
        where: { id: waId },
        data: { savedFirstName: firstName, savedLastName: lastName }
      });

      await this.sessionService.setSession(waId, 'main', { ...session, step: 'collect:email' });
      return this.client.sendText(waId, `Thanks, ${firstName}! What is your *email address*?`);
    }

    if (session?.step === 'collect:email') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRe.test(text.trim().toLowerCase()) || text.trim().length > 254) {
        return this.client.sendText(waId, '⚠️ Please enter a valid email address.');
      }

      await this.prisma.whatsAppUser.update({
        where: { id: waId },
        data: { savedEmail: text.trim() }
      });

      return this.promptNewAddress(waId, session.storeSlug);
    }

    if (session?.step === 'freeAddress') {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length < 10) {
        return this.client.sendText(waId, '⚠️ Please enter a complete address (at least 10 characters).');
      }
      await this.sessionService.setSession(waId, 'main', {
        ...session,
        streetLine: trimmed,
        barangay: '',
        city: '',
        province: '',
        address: trimmed,
        step: 'labelType',
      });
      return this.client.sendInteractive(waId, buildLabelMenu(session.storeSlug));
    }

    if (session?.step === 'labelType') {
      const label = text.trim();
      if (label.length < 1 || label.length > 30) {
        return this.client.sendText(waId, '⚠️ Label must be 1–30 characters. Or tap a button above.');
      }
      return this.saveAndApplyAddress(waId, session, label);
    }

    if (session?.step === 'confirm' && text.toLowerCase().includes('place order')) {
      const slug = session.storeSlug;
      const { allowed, waitSec } = await this.checkout.checkRateLimit(waId, 'whatsapp');
      if (!allowed) {
        return this.client.sendText(waId, `⏳ Please wait ${waitSec}s before placing another order.`);
      }

      await this.client.sendText(waId, '⏳ Processing your order... Please wait.');

      try {
        const { orderId, total, retailer, payment, items } = await this.checkout.placeOrder(waId, session, 'whatsapp');
        
        // Cleanup session only on SUCCESS
        await this.sessionService.deleteSession(waId, 'main');

        let finalMsg = `✅ *Order #${orderId} Placed!*\n\nThank you ${session.name}, your order has been received and is being processed by *${retailer.name}*.\n\n`;

        if (payment?.paymentUrl) {
          const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(payment.paymentUrl);
          if (isLocalUrl) {
            finalMsg += `💳 *Complete Payment (Local Dev):*\n${payment.paymentUrl}`;
            await this.client.sendText(waId, finalMsg);
            await this.client.sendInteractive(waId, {
              type: 'button',
              body: { text: 'What would you like to do next?' },
              action: {
                buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${slug}`, title: '🏠 Main Menu' } }]
              }
            });
          } else {
            await this.client.sendInteractive(waId, {
              type: 'button',
              body: { text: finalMsg },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: `pay:${slug}:${orderId}`, title: 'Pay Now 💳' } },
                  { type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${slug}`, title: '🏠 Main Menu' } }
                ]
              }
            });
          }
        } else {
          finalMsg += `📦 Status: *Pending Delivery*`;
          await this.client.sendInteractive(waId, {
            type: 'button',
            body: { text: finalMsg },
            action: {
              buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${slug}`, title: '🏠 Main Menu' } }]
            }
          });
        }

        // 4. Notify seller if configured
        if (retailer.whatsappNotifyNumber) {
          const itemLines = items.map(i => `• ${i.title} × ${i.quantity} = ₱${(i.price * i.quantity).toLocaleString()}`).join('\n');
          const notifyMsg =
            `🔔 *New Order #${orderId}*\n\n` +
            `*Store:* ${retailer.name}\n` +
            `*Customer:* ${session.name || 'WhatsApp Buyer'} (${waId})\n\n` +
            `*Items:*\n${itemLines}\n\n` +
            `*Total:* ₱${total.toLocaleString()}\n\n` +
            `*Address:*\n${session.address}\n\n` +
            `*Payment:* ${(session.paymentMethod || payment?.provider || 'cod').toUpperCase()}\n\n` +
            `_Check Admin Panel for details._`;

          this.client.sendText(retailer.whatsappNotifyNumber, notifyMsg).catch(err => {
            this.logger.error(`Failed to send WhatsApp notification to seller: ${err.message}`);
          });
        }

      } catch (err: any) {
        this.logger.error(`Checkout failed: ${err.message}`);
        return this.client.sendInteractive(waId, {
          type: 'button',
          body: { text: `❌ Order placement failed: ${err.message}` },
          action: {
            buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${slug}`, title: '🏠 Main Menu' } }]
          }
        });
      }
    }

    // AI Chat Mode Interception
    if (session?.step === 'ai_chat') {
      if (text.toLowerCase() === 'exit' || text.toLowerCase() === 'quit') {
        await this.sessionService.setSession(waId, 'main', { ...session, step: undefined });
        return this.client.sendInteractive(waId, {
          type: 'button',
          body: { text: 'Exited AI Assistant mode.' },
          action: {
            buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${session.storeSlug}`, title: '🏠 Main Menu' } }]
          }
        });
      }

      const retailer = await this.registry.findBySlug(session.storeSlug);
      if (!retailer) return;

      const aiConfig = {
        provider: (retailer.aiProvider || 'claude') as 'claude' | 'gemini' | 'openai',
        apiKey: retailer.aiApiKey || '',
        model: retailer.aiModel,
        systemPrompt: retailer.aiSystemPrompt,
        serperApiKey: retailer.serperApiKey,
      };

      if (!aiConfig.apiKey) {
        return this.client.sendText(waId, '⚠️ AI Assistant is not configured for this store.');
      }

      const conv = await this.conversationService.getOrCreate(
        String(waId),
        name || 'Customer',
        session.storeSlug,
        'whatsapp'
      );

      // Fire-and-forget thinking indicator (WhatsApp has no native disappearing indicator)
      this.client.sendText(waId, '🤔 Got it, let me look into that...')
        .catch(err => this.logger.warn(`Thinking indicator failed: ${err.message}`));

      try {
        const result = await this.aiChat.chat(
          String(waId),
          session.storeSlug,
          retailer.name,
          { slug: retailer.slug, mcpServerUrl: retailer.mcpServerUrl, platformKey: retailer.platformKey?.key || '' },
          text,
          aiConfig,
          conv,
          'whatsapp'
        );

        // 1. Send AI text reply
        await this.client.sendText(waId, result.text);

        const cartCount = (await this.cartService.get(cartUserId, session.storeSlug)).length;

        // 2. If AI returned products, show as cards (matching Telegram UX)
        if (result.products && result.products.length > 0) {
          await this.sendSearchCards(waId, result.products as any[], session.storeSlug, {
            query: text,
            cartCount,
            totalResults: result.products.length,
          });
        }

        // 3. Always show AI chat footer/navigation (Issue 4c)
        const shell = buildAiChatFooter(session.storeSlug, retailer.name, 'whatsapp', cartCount);
        if (shell.whatsAppButtons) {
          await this.client.sendInteractive(waId, shell.whatsAppButtons);
        }
        return;
      } catch (err: any) {
        this.logger.error(`AI Chat failed: ${err.message}`);
        return this.client.sendText(waId, 'Sorry, my AI isn\'t available right now.');
      }
    }

    // Natural Language Search! (Fire-and-forget searching indicator)
    const safeText = text.replace(/[*_~`]/g, '');
    this.client.sendText(waId, `🔎 Searching "${safeText}"...${page > 1 ? ` (Page ${page})` : ''}`)
      .catch(err => this.logger.warn(`Searching indicator failed: ${err.message}`));

    // Fall back to catalog smart search
    const PAGE_SIZE = 10;
    const offset = (page - 1) * PAGE_SIZE;
    const { results, total } = await this.catalog.smartSearch(text, { 
      limit: PAGE_SIZE, 
      offset,
      storeSlug: session?.storeSlug
    });
    
    const storeResults = results;

    if (storeResults.length === 0 && page === 1) {
      const emptyMsg = session?.storeSlug 
        ? `🔍 No products found for "${safeText}" in this store.`
        : `🔍 No products found for "${safeText}" across all stores.`;

      if (session?.storeSlug) {
        return this.client.sendInteractive(waId, {
          type: 'button',
          body: { text: emptyMsg },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${session.storeSlug}`, title: '🏠 Main Menu' } },
              { type: 'reply', reply: { id: 'start', title: '⬅️ Change Store' } }
            ]
          }
        });
      } else {
        const retailers = await this.registry.findActiveRetailers();
        return this.client.sendInteractive(waId, {
          ...buildStoreListMenu(retailers.map(r => ({ slug: r.slug, name: r.name }))),
          body: { text: emptyMsg + ' Please select a store to start shopping.' }
        });
      }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const cartCount = session?.storeSlug ? (await this.cartService.get(cartUserId, session.storeSlug)).length : 0;

    if (session) {
      await this.sessionService.setSession(waId, 'main', { ...session, source: 'search', lastQuery: text });
    }

    // Send results as individual product cards (matching Telegram UX)
    await this.sendSearchCards(waId, storeResults as any[], session?.storeSlug || 'all', {
      query: text,
      page,
      totalPages,
      totalResults: total,
      cartCount,
    });
  }

  private async routeInteractive(waId: string, payload: string): Promise<any> {
    this.logger.log(`Received interactive click from ${waId}: ${payload}`);
    const parts = payload.split(':');
    const action = parts[0];
    const cartUserId = `wa:${waId}`;

    if (action === 'start') {
      await this.sessionService.deleteSession(waId, 'main');
      const retailers = await this.registry.findActiveRetailers();
      if (retailers.length === 1) {
        await this.sessionService.setSession(waId, 'main', { storeSlug: retailers[0].slug });
        return this.showStoreMainMenu(waId, retailers[0].slug);
      }
      return this.client.sendInteractive(waId,
        buildStoreListMenu(retailers.map(r => ({ slug: r.slug, name: r.name }))));
    }

    // Example payload: store_sel:my-store
    // Example payload: prod_sel:my-store:123

    if (action === WA_ACTION.STORE_SELECT || action === WA_ACTION.STORE_MENU || action === 'store' || action === 'store_menu') {
      const targetSlug = parts[1];
      if (!targetSlug) {
        const retailers = await this.registry.findActiveRetailers();
        return this.client.sendInteractive(waId, {
          ...buildStoreListMenu(retailers.map(r => ({ slug: r.slug, name: r.name }))),
          body: { text: 'Store selection error. Please select a store below to continue.' }
        });
      }
      await this.sessionService.setSession(waId, 'main', { storeSlug: targetSlug });
      return this.showStoreMainMenu(waId, targetSlug);
    }

    if (action === 'pay') {
      const targetSlug = parts[1];
      const orderId = parseInt(parts[2], 10);
      
      // Fallback for legacy ID format if needed
      const finalSlug = orderId ? targetSlug : (await this.sessionService.getSession<any>(waId, 'main'))?.storeSlug;
      const finalOrderId = orderId || parseInt(targetSlug, 10);

      if (!finalSlug || !finalOrderId) {
        const retailers = await this.registry.findActiveRetailers();
        return this.client.sendInteractive(waId, {
          ...buildStoreListMenu(retailers.map(r => ({ slug: r.slug, name: r.name }))),
          body: { text: '❌ Payment error. Please select a store to start again.' }
        });
      }

      const payment = await this.prisma.payment.findFirst({
        where: { orderId: finalOrderId, storeSlug: finalSlug, buyerRef: waId },
        orderBy: { createdAt: 'desc' }
      });

      if (!payment || !payment.paymentUrl) {
        return this.client.sendInteractive(waId, {
          type: 'button',
          body: { text: `❌ Could not find payment link for Order #${finalOrderId}. Please contact the store.` },
          action: {
            buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${finalSlug}`, title: '🏠 Main Menu' } }]
          }
        });
      }

      return this.client.sendText(waId, `💳 *Complete Payment for Order #${finalOrderId}:*\n${payment.paymentUrl}`);
    }

    let session = await this.sessionService.getSession<any>(waId, 'main');
    
    // ── Issue 1: Auto-restart expired sessions ──────────────────────────────
    if (!session || !session.storeSlug) {
      const recoveredSlug = parts[1];
      if (recoveredSlug) {
        const retailer = await this.registry.findBySlug(recoveredSlug);
        if (retailer) {
          this.logger.log(`Recovering expired session for ${waId} using slug: ${recoveredSlug}`);
          session = { storeSlug: recoveredSlug };
          await this.sessionService.setSession(waId, 'main', session);
        }
      }
    }

    if (!session || !session.storeSlug) {
      const retailers = await this.registry.findActiveRetailers();
      if (retailers.length === 0) {
        return this.client.sendText(waId, 'No stores are currently active. Please try again later.');
      }
      if (retailers.length === 1) {
        const store = retailers[0];
        await this.sessionService.setSession(waId, 'main', { storeSlug: store.slug });
        return this.showStoreMainMenu(waId, store.slug);
      }
      
      return this.client.sendInteractive(waId,
        buildStoreListMenu(retailers.map(r => ({ slug: r.slug, name: r.name }))));
    }
    const slug = session.storeSlug;

    if (action === 'confirm_order') {
      // Reuse the existing place order logic by simulating the text message
      return this.routeMessage(waId, session?.name || 'Buyer', 'place order', 'manual_confirm');
    }

    if (action === WA_ACTION.PREV_PAGE || action === WA_ACTION.NEXT_PAGE) {
      const page = parseInt(parts[1], 10);
      const query = session.lastQuery || 'all';
      return this.routeMessage(waId, session?.name || 'Buyer', query, 'manual_nav', page);
    }

    if (action === 'cancel_order') {
      const targetSlug = parts[1];
      // Instead of deleting session, just clear the checkout step
      await this.sessionService.setSession(waId, 'main', { ...session, step: undefined });
      return this.client.sendInteractive(waId, {
        type: 'button',
        body: { text: '❌ Order cancelled. What would you like to do next?' },
        action: {
          buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${targetSlug}`, title: '🏠 Main Menu' } }]
        }
      });
    }

    if (action === 'back_to_search') {
      if (!session.lastQuery) {
        // No prior search — fall back to category menu rather than searching "all"
        const categories = await this.catalog.getCategories(slug);
        return this.client.sendInteractive(waId, buildCategoryListMenu(slug, categories as any));
      }
      return this.routeMessage(waId, session?.name || 'Buyer', session.lastQuery, 'manual_search');
    }

    if (action === 'back_to_cat') {
      const catId = session.lastCategory;
      return this.routeInteractive(waId, `${WA_ACTION.CAT_SELECT}:${slug}:${catId}`);
    }

    if (action === WA_ACTION.CAT_MENU) {
      const targetSlug = parts[1] || slug;
      const categories = await this.catalog.getCategories(targetSlug);
      await this.sessionService.setSession(waId, 'main', { ...session, source: 'main' });
      return this.client.sendInteractive(waId, buildCategoryListMenu(targetSlug, categories as any));
    }

    if (action === WA_ACTION.CAT_SELECT) {
      const targetSlug = parts[1] || slug;
      const catId = parseInt(parts[2], 10);
      const products = await this.catalog.getProducts(targetSlug, { categoryId: catId, limit: 10 });
      const cartCount = (await this.cartService.get(cartUserId, targetSlug)).length;
      
      await this.sessionService.setSession(waId, 'main', { ...session, source: 'category', lastCategory: catId });

      await this.sendSearchCards(waId, products as any[], targetSlug, {
        cartCount,
        totalResults: products.length,
      });
    }

    if (action === WA_ACTION.DELIVERY_SEL) {
      const type = parts[2] as 'delivery' | 'pickup';
      await this.sessionService.setSession(waId, 'main', { ...session, deliveryType: type, step: 'payment' });
      return this.showPaymentMenu(waId, slug);
    }

    if (action === WA_ACTION.LABEL_SEL) {
      const label = parts[2];
      return this.saveAndApplyAddress(waId, session, label);
    }

    if (action === WA_ACTION.AI_CHAT) {
      await this.sessionService.setSession(waId, 'main', { ...session, step: 'ai_chat', source: 'ai' });
      const retailer = await this.registry.findBySlug(slug);
      const greeting = this.catalogFormatter.formatAiGreeting(retailer?.name ?? 'this store', 'whatsapp');
      
      await this.client.sendText(waId, greeting);
      
      const cartCount = (await this.cartService.get(cartUserId, slug)).length;
      const shell = buildAiChatFooter(slug, retailer?.name ?? 'Store', 'whatsapp', cartCount);
      if (shell.whatsAppButtons) {
        await this.client.sendInteractive(waId, shell.whatsAppButtons);
      }
      return;
    }

    if (action === WA_ACTION.PROD_SELECT) {
      const targetSlug = parts[1];
      const productId = parseInt(parts[2], 10);
      const product = await this.prisma.cachedProduct.findUnique({
        where: { storeSlug_sellerId: { storeSlug: targetSlug, sellerId: productId } }
      });

      if (!product) {
        return this.client.sendInteractive(waId, {
          type: 'button',
          body: { text: 'Product not found.' },
          action: {
            buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${targetSlug}`, title: '🏠 Main Menu' } }]
          }
        });
      }

      // If user selected a product from a different store than current session, switch store
      if (session.storeSlug !== targetSlug) {
        await this.sessionService.setSession(waId, 'main', { ...session, storeSlug: targetSlug });
      }

      const retailer = await this.registry.findBySlug(targetSlug);
      const mcpUrl = retailer?.mcpServerUrl;
      const detailText = this.catalogFormatter.productDetail(product, 'whatsapp', mcpUrl);
      const imageUrl = await this.browsing.resolveImageUrl(product, targetSlug);

      if (imageUrl) {
        try {
          await this.client.sendImage(waId, imageUrl, detailText);
        } catch (err) {
          await this.client.sendText(waId, detailText);
        }
      } else {
        await this.client.sendText(waId, detailText);
      }

      const cartCount = await this.cartService.getItemQty(cartUserId, targetSlug, product.sellerId);
      await this.client.sendInteractive(waId, buildProductDetailButtons(product as any, targetSlug, cartCount, session.source));
      return;
    }

    if (action === WA_ACTION.QTY_SEL) {
      const targetSlug = parts[1];
      const productId = parseInt(parts[2], 10);
      return this.client.sendInteractive(waId, buildQuantityMenu(targetSlug, productId));
    }

    if (action === WA_ACTION.CART_ADD) {
      const targetSlug = parts[1];
      const productId = parseInt(parts[2], 10);
      const qty = Math.max(1, Math.min(99, parseInt(parts[3] || '1', 10)));
      const product = await this.prisma.cachedProduct.findUnique({
        where: { storeSlug_sellerId: { storeSlug: targetSlug, sellerId: productId } }
      });

      if (!product) return this.client.sendText(waId, 'Product no longer available.');

      await this.cartService.add(cartUserId, targetSlug, {
        productId: product.sellerId,
        title: product.title,
        price: product.price || 0
      }, qty);

      await this.client.sendText(waId, `✅ Added ${qty}x ${product.title} to cart.`);
      const items = await this.cartService.get(cartUserId, targetSlug);
      await this.client.sendInteractive(waId, buildCartMenu(targetSlug, items.length));
      return;
    }

    if (action === WA_ACTION.CART_VIEW || action === 'cart') {
      const targetSlug = parts[1] || slug;
      await this.sessionService.setSession(waId, 'main', { ...session, source: 'cart' });
      if (parts[2] === 'clear') {
        await this.cartService.clear(cartUserId, targetSlug);
        return this.client.sendInteractive(waId, {
          type: 'button',
          body: { text: '🗑 Cart cleared.' },
          action: {
            buttons: [{ type: 'reply', reply: { id: `${WA_ACTION.STORE_MENU}:${targetSlug}`, title: '🏠 Main Menu' } }]
          }
        });
      }

      const items = await this.cartService.get(cartUserId, targetSlug);
      const total = await this.cartService.total(cartUserId, targetSlug);
      const retailer = await this.registry.findBySlug(targetSlug);
      const storeName = retailer ? retailer.name : 'Store';

      await this.client.sendText(waId, this.catalogFormatter.cartSummary(storeName, items, total, 'whatsapp'));
      await this.client.sendInteractive(waId, buildCartMenu(targetSlug, items.length));
      return;
    }

    if (action === WA_ACTION.CHECKOUT) {
      const targetSlug = parts[1] || slug;
      const items = await this.cartService.get(cartUserId, targetSlug);
      if (items.length === 0) {
        return this.client.sendText(waId, 'Your cart is empty.');
      }
      return this.handleCheckout(waId, targetSlug);
    }

    if (action === WA_ACTION.ADDR_SELECT) {
      const targetSlug = parts[1] || slug;
      const addressId = parseInt(parts[2], 10);
      const address = await this.prisma.whatsAppAddress.findUnique({ where: { id: addressId } });
      if (!address || address.userId !== waId) return this.client.sendText(waId, 'Address error.');

      // Promote to default (most recently used)
      await this.prisma.whatsAppAddress.updateMany({ where: { userId: waId, isDefault: true }, data: { isDefault: false } });
      await this.prisma.whatsAppAddress.update({ where: { id: addressId }, data: { isDefault: true } });

      const retailer = await this.registry.findBySlug(targetSlug);
      const addressStr = [address.streetLine, address.barangay, address.city, address.province, address.postalCode].filter(Boolean).join(', ');
      
      const sessionUpdate = {
        ...session,
        storeSlug: targetSlug,
        address: addressStr,
        province: address.province,
        city: address.city,
        barangay: address.barangay || '',
        streetLine: address.streetLine,
        postalCode: address.postalCode || '',
        lat: Number(address.lat) || undefined,
        lng: Number(address.lng) || undefined,
      };

      if (retailer?.allowsPickup) {
        await this.sessionService.setSession(waId, 'main', { ...sessionUpdate, step: 'delivery' });
        return this.client.sendInteractive(waId, buildDeliveryMenu(targetSlug, true));
      } else {
        await this.sessionService.setSession(waId, 'main', { ...sessionUpdate, deliveryType: 'delivery', step: 'payment' });
        return this.showPaymentMenu(waId, targetSlug);
      }
    }

    if (action === WA_ACTION.ADDR_NEW) {
      const targetSlug = parts[1] || slug;
      return this.promptNewAddress(waId, targetSlug);
    }

    if (action === WA_ACTION.PAY_SEL) {
      const targetSlug = parts[1] || slug;
      const method = parts[2];
      // session already read at top of routeInteractive — no second DB call needed
      const user = await this.prisma.whatsAppUser.findUnique({ where: { id: waId } });
      const fullName = `${user?.savedFirstName || 'Buyer'} ${user?.savedLastName || ''}`.trim();

      await this.sessionService.setSession(waId, 'main', { ...session, paymentMethod: method, step: 'confirm', name: fullName });

      const items = await this.cartService.get(cartUserId, targetSlug);
      const total = await this.cartService.total(cartUserId, targetSlug);
      const summary = this.catalogFormatter.cartSummary('Review Order', items, total, 'whatsapp');

      const deliveryLabel = session.deliveryType === 'pickup' ? '🏪 *Store Pickup*' : '🏠 *Home Delivery*';
      const confirmText = `${summary}\n\n👤 *Customer:* ${fullName}\n🚚 *Type:* ${deliveryLabel}\n📍 *Address:* ${session.address}\n💳 *Payment:* ${method.toUpperCase()}`;
      
      return this.client.sendInteractive(waId, {
        type: 'button',
        body: { text: confirmText },
        action: {
          buttons: [
            { type: 'reply', reply: { id: `confirm_order:${targetSlug}`, title: '✅ Confirm Order' } },
            { type: 'reply', reply: { id: `cancel_order:${targetSlug}`, title: '❌ Cancel' } },
          ]
        }
      });
    }
  }

  private async showStoreMainMenu(waId: string, storeSlug: string, session?: any) {
    const retailer = await this.registry.findBySlug(storeSlug);
    if (!retailer) return this.client.sendText(waId, 'Store not found.');

    if (session?.step === 'ai_chat') {
      const cartUserId = `wa:${waId}`;
      const cartCount = (await this.cartService.get(cartUserId, storeSlug)).length;
      const shell = buildAiChatFooter(storeSlug, retailer.name, 'whatsapp', cartCount);
      if (shell.whatsAppButtons) {
        return this.client.sendInteractive(waId, shell.whatsAppButtons);
      }
    }

    return this.client.sendInteractive(waId, buildStoreMainMenu(retailer.name, storeSlug));
  }

  private async handleCheckout(waId: string, slug: string) {
    const user = await this.prisma.whatsAppUser.findUnique({
      where: { id: waId },
      include: { addresses: true }
    });

    if (user?.savedFirstName && user?.addresses.length > 0) {
      return this.client.sendInteractive(waId, buildAddressSelectMenu(slug, user.addresses));
    } else if (!user?.savedFirstName) {
      await this.sessionService.setSession(waId, 'main', { storeSlug: slug, step: 'collect:name' });
      return this.client.sendText(waId, 'Let\'s get your details for the order.\n\nWhat is your *Full Name*?');
    } else {
      // Has name but no address
      return this.promptNewAddress(waId, slug);
    }
  }

  private async promptNewAddress(waId: string, slug: string) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || await this.settings.get('google_places_api_key');
    const session = await this.sessionService.getSession<any>(waId, 'main');

    if (apiKey) {
      const token = await this.addressPicker.createPickerToken('whatsapp', waId, slug);
      const gatewayUrl = await this.settings.get('gateway_public_url') || 'http://localhost:3002';
      const pickerUrl = `${gatewayUrl}/address-picker?token=${token}&channel=whatsapp`;

      await this.sessionService.setSession(waId, 'main', { ...session, storeSlug: slug, step: 'freeAddress' });

      return this.client.sendText(
        waId,
        `📍 *Enter Delivery Address*\n\nOpen this link to pick your address:\n${pickerUrl}\n\n` +
        `_Alternatively, just type your full address here and we'll use that._`
      );
    }

    // No API key — go straight to text prompt
    await this.sessionService.setSession(waId, 'main', { storeSlug: slug, step: 'freeAddress' });
    return this.client.sendText(
      waId,
      '📍 Please type your full delivery address:\n_(e.g. "123 Main St, Barangay San Jose, Makati City, Metro Manila")_'
    );
  }

  async handlePickerCancelled(waId: string, storeSlug: string) {
    const session = await this.sessionService.getSession<any>(waId, 'main');
    await this.sessionService.setSession(waId, 'main', {
      ...session,
      storeSlug,
      step: 'freeAddress',
    });
    await this.client.sendText(
      waId,
      '📍 No problem! Please type your full delivery address:\n' +
      '_(e.g. "123 Main St, Barangay San Jose, Makati City, Metro Manila")_'
    );
  }

  private async saveAndApplyAddress(waId: string, session: any, label: string) {
    const updatedState = await this.checkout.saveAddress({
      userId: waId,
      platform: 'whatsapp',
      state: session,
      label
    });

    const retailer = await this.registry.findBySlug(updatedState.storeSlug);

    if (retailer?.allowsPickup) {
      updatedState.step = 'delivery';
      await this.sessionService.setSession(waId, 'main', updatedState);
      return this.client.sendInteractive(waId, buildDeliveryMenu(updatedState.storeSlug, true));
    } else {
      updatedState.step = 'payment';
      updatedState.deliveryType = 'delivery';
      await this.sessionService.setSession(waId, 'main', updatedState);
      return this.showPaymentMenu(waId, updatedState.storeSlug);
    }
  }

  private async showPaymentMenu(waId: string, slug: string) {
    const retailer = await this.registry.findBySlug(slug);
    if (!retailer) {
      const retailers = await this.registry.findActiveRetailers();
      return this.client.sendInteractive(waId, {
        ...buildStoreListMenu(retailers.map(r => ({ slug: r.slug, name: r.name }))),
        body: { text: 'Store error. Please select a store below to continue.' }
      });
    }

    let methods: string[] = ['cod'];
    try {
      methods = JSON.parse(retailer.paymentMethods);
    } catch { /* use default cod */ }

    return this.client.sendInteractive(waId, buildPaymentMenu(slug, methods));
  }

  async sendMessage(waId: string, text: string): Promise<void> {
    await this.client.sendText(waId, text);
  }

  async handlePickerAddress(waId: string, storeSlug: string, address: any) {
    const session = await this.sessionService.getSession<CheckoutState>(waId, 'main');
    if (!session) return;

    // Sanitize and update session with sanitized address details
    const updatedSession: CheckoutState = {
      ...session,
      streetLine: String(address.streetLine  || '').slice(0, 200),
      barangay:   String(address.barangay    || '').slice(0, 100),
      city:       String(address.city        || '').slice(0, 100),
      province:   String(address.province    || '').slice(0, 100),
      postalCode: String(address.postalCode  || '').slice(0, 20),
      address:    String(address.formattedAddress || '').slice(0, 300),
      lat:        typeof address.lat === 'number' ? address.lat : undefined,
      lng:        typeof address.lng === 'number' ? address.lng : undefined,
      step:       'labelType', // Skip to label selection
    };

    await this.sessionService.setSession(waId, 'main', updatedSession);

    await this.client.sendText(waId, `✅ Got your address:\n*${updatedSession.address}*`);
    return this.client.sendInteractive(waId, buildLabelMenu(storeSlug));
  }
}
