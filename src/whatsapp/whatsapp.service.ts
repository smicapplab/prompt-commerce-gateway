import { Injectable, OnModuleInit, Logger, Inject, Optional, forwardRef } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';
import { RegistryService } from '../registry/registry.service';
import { SettingsService } from '../settings/settings.service';
import { CatalogService } from '../catalog/catalog.service';
import { AiChatService } from '../telegram/ai-chat.service';
import { CartService } from '../telegram/cart.service';
import { ConversationService } from '../chat/conversation.service';
import { PaymentService } from '../payments/payment.service';
import { WhatsAppClient } from './whatsapp-client';
import { WhatsAppSessionService } from './whatsapp-session.service';
import { CatalogFormatter } from '../catalog/catalog-formatter';
import { callRetailerTool } from '../mcp/retailer-client';
import { 
  buildStoreListMenu, 
  buildStoreMainMenu, 
  buildSearchResultsList, 
  buildProductDetailMenu, 
  buildCartMenu,
  buildAddressSelectMenu,
  buildPaymentMenu,
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
    @Inject(forwardRef(() => ConversationService)) private readonly conversationService: ConversationService,
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly client: WhatsAppClient,
    private readonly sessionService: WhatsAppSessionService,
    private readonly catalogFormatter: CatalogFormatter,
    @Optional() private readonly paymentService?: PaymentService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initClient();
  }

  async initClient(): Promise<void> {
    const phoneNumberId = (await this.settings.get('whatsapp_phone_number_id'))?.trim() ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = (await this.settings.get('whatsapp_access_token'))?.trim() ?? process.env.WHATSAPP_ACCESS_TOKEN;
    const webhookSecret = (await this.settings.get('whatsapp_webhook_secret'))?.trim();

    if (phoneNumberId && accessToken && webhookSecret) {
      this.client.setConfig(phoneNumberId, accessToken, webhookSecret);
      this.logger.log('WhatsAppClient configured.');
    } else {
      this.logger.warn('WhatsApp configuration incomplete. Bot is disabled.');
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    if (!this.client.isConfigured()) return;
    
    // Verify Meta signature to reject spoofed/tampered webhooks
    const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (signature && !this.client.verifySignature(rawBody, signature)) {
      this.logger.warn('Webhook signature mismatch — request rejected.');
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

  private async routeMessage(waId: string, name: string, text: string, messageId: string) {
    this.logger.log(`Received text message from ${waId}: ${text}`);
    
    // Command overrides
    if (text.toLowerCase() === '/start' || text.toLowerCase() === 'menu') {
      const activeRetailers = await this.registry.findActiveRetailers();
      if (activeRetailers.length === 0) {
        return this.client.sendText(waId, 'No stores are currently active.');
      } else if (activeRetailers.length === 1) {
        // Auto-select single store
        const store = activeRetailers[0];
        await this.sessionService.setSession(waId, 'main', { storeSlug: store.slug });
        return this.client.sendInteractive(waId, buildStoreMainMenu(store.name, store.slug));
      } else {
        await this.sessionService.deleteSession(waId, 'main');
        const storeMap = activeRetailers.map(r => ({ slug: r.slug, name: r.name }));
        return this.client.sendInteractive(waId, buildStoreListMenu(storeMap));
      }
    }

    // Standard routing
    const session = await this.sessionService.getSession<any>(waId, 'main');
    if (!session || !session.storeSlug) {
      const activeRetailers = await this.registry.findActiveRetailers();
      const storeMap = activeRetailers.map(r => ({ slug: r.slug, name: r.name }));
      return this.client.sendInteractive(waId, buildStoreListMenu(storeMap));
    }

    // ── Unified Logging: Log buyer message ──
    try {
      const conv = await this.conversationService.getOrCreate(String(waId), name || 'Buyer', session.storeSlug, 'whatsapp');
      await this.conversationService.logMessage(conv.id, session.storeSlug, 'buyer', text);
    } catch (err) {
      this.logger.error(`Failed to log message: ${err}`);
    }

    // Checkout Flow Interception
    if (session.step === 'collect:name') {
      await this.sessionService.setSession(waId, 'main', { ...session, name: text, step: 'collect:address' });
      return this.client.sendText(waId, `Thanks, ${text}! Now, what is your *Delivery Address*?\n(Street, Barangay, City, Province)`);
    }

    if (session.step === 'collect:address') {
      // Create permanent address record
      await this.prisma.whatsAppAddress.create({
        data: {
          userId: waId,
          label: 'Primary',
          streetLine: text,
          city: 'Unknown', // In real flow we'd parse this better
          province: 'Unknown',
          isDefault: true
        }
      });
      await this.sessionService.setSession(waId, 'main', { 
        ...session, 
        address: text, 
        step: 'payment' 
      });
      return this.showPaymentMenu(waId, session.storeSlug);
    }

    if (session.step === 'confirm' && text.toLowerCase().includes('place order')) {
      const slug = session.storeSlug;
      const cartUserId = `wa:${waId}`;
      const items = await this.cartService.get(cartUserId, slug);
      
      if (!items.length) return this.client.sendText(waId, 'Your cart is empty.');

      const retailer = await this.registry.findBySlug(slug);
      if (!retailer) return this.client.sendText(waId, 'Store error.');

      try {
        // 1. Create order on Seller Server via MCP
        const mcpRes = await callRetailerTool(
          { 
            slug: retailer.slug, 
            mcpServerUrl: retailer.mcpServerUrl, 
            platformKey: retailer.platformKey?.key || '' 
          },
          'create_order',
          {
            items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
            buyer_ref: waId,
            channel: 'whatsapp',
            notes: `Buyer: ${session.name}\nAddress: ${session.address}`,
            confirm: true,
            payment_provider: session.paymentMethod
          }
        ) as { content: any[] };

        const orderJson = JSON.parse(mcpRes.content.find(c => c.type === 'text' && c.text.includes('order_id'))?.text || '{}');
        const orderId = orderJson.order_id;

        if (!orderId) throw new Error('Order creation failed on seller server.');

        // 2. Initiate Payment on Gateway
        const total = await this.cartService.total(cartUserId, slug);
        const baseUrl = await this.settings.get('gateway_public_url') || 'http://localhost:3002';

        const payment = await this.paymentService?.initiatePayment({
          orderId,
          storeSlug: slug,
          buyerRef: waId,
          amount: total,
          currency: 'PHP',
          description: `Order #${orderId} at ${retailer.name}`,
          baseUrl,
          providerOverride: session.paymentMethod
        });

        // 3. Send final confirmation
        await this.cartService.clear(cartUserId, slug);
        await this.sessionService.deleteSession(waId, 'main'); // delete, not null-set, to prevent stuck state

        let finalMsg = `✅ *Order #${orderId} Placed!*\n\nThank you ${session.name}, your order has been received and is being processed by *${retailer.name}*.\n\n`;
        
        if (payment?.paymentUrl) {
          if (payment.paymentUrl.includes('localhost') || payment.paymentUrl.includes('127.0.0.1')) {
            finalMsg += `💳 *Complete Payment:*\n${payment.paymentUrl}`;
            await this.client.sendText(waId, finalMsg);
          } else {
            await this.client.sendInteractive(waId, {
              type: 'button',
              body: { text: finalMsg },
              action: {
                buttons: [{ type: 'reply', reply: { id: `pay:${orderId}`, title: 'Pay Now 💳' } }]
              }
            });
          }
        } else {
          finalMsg += `📦 Status: *Pending Delivery*`;
          await this.client.sendText(waId, finalMsg);
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
            `*Payment:* ${session.paymentMethod.toUpperCase()}\n\n` +
            `_Check Admin Panel for details._`;
          
          this.client.sendText(retailer.whatsappNotifyNumber, notifyMsg).catch(err => {
            this.logger.error(`Failed to send WhatsApp notification to seller: ${err.message}`);
          });
        }

      } catch (err: any) {
        this.logger.error(`Checkout failed: ${err.message}`);
        return this.client.sendText(waId, `❌ Order placement failed: ${err.message}`);
      }
    }

    // AI Chat Mode Interception
    if (session.step === 'ai_chat') {
      if (text.toLowerCase() === 'exit' || text.toLowerCase() === 'quit') {
        await this.sessionService.setSession(waId, 'main', { ...session, step: undefined });
        return this.client.sendText(waId, 'Exited AI Assistant mode. Type a search or choose an option from the menu.');
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

      // To keep it simple for WhatsApp, we use a single conversation scope per user/store
      const conv = await this.conversationService.getOrCreate(
        String(waId), 
        name || 'Customer', 
        session.storeSlug,
        'whatsapp'
      );

      this.client.sendText(waId, '...'); // typing indicator workaround

      try {
        const result = await this.aiChat.chat(
          String(waId),
          session.storeSlug,
          retailer.name,
          { slug: retailer.slug, mcpServerUrl: retailer.mcpServerUrl, platformKey: retailer.platformKey?.key || '' },
          text,
          aiConfig,
          conv.id
        );

        return this.client.sendText(waId, result.text);
      } catch (err: any) {
        this.logger.error(`AI Chat failed: ${err.message}`);
        return this.client.sendText(waId, 'Sorry, my AI isn\'t available right now.');
      }
    }

    // Natural Language Search!
    this.client.sendText(waId, `🔎 Searching "${text}"...`);
    
    // Fall back to catalog smart search
    const { results } = await this.catalog.smartSearch(text);
    const storeResults = results.filter(r => r.storeSlug === session.storeSlug).slice(0, 10); 

    if (storeResults.length === 0) {
      return this.client.sendText(waId, `🔍 No products found for "${text}". Try a different search.`);
    }

    // Send visual list
    await this.client.sendInteractive(waId, buildSearchResultsList(storeResults, text, session.storeSlug));
  }

  private async routeInteractive(waId: string, payload: string) {
    this.logger.log(`Received interactive click from ${waId}: ${payload}`);
    const parts = payload.split(':');
    const action = parts[0];

    // Example payload: store_sel:my-store
    // Example payload: prod_sel:my-store:123
    
    if (action === WA_ACTION.STORE_SELECT) {
      const storeSlug = parts[1];
      const retailer = await this.registry.findBySlug(storeSlug);
      if (!retailer) return this.client.sendText(waId, 'Store not found.');
      
      await this.sessionService.setSession(waId, 'main', { storeSlug });
      await this.client.sendInteractive(waId, buildStoreMainMenu(retailer.name, storeSlug));
      return;
    }

    const session = await this.sessionService.getSession<PlatformSession & { step?: string }>(waId, 'main');
    if (!session || !session.storeSlug) {
      return this.client.sendText(waId, 'Your session expired. Please type /start to select a store again.');
    }
    const slug = session.storeSlug;

    if (action === WA_ACTION.AI_CHAT) {
      await this.sessionService.setSession(waId, 'main', { ...session, step: 'ai_chat' });
      const retailer = await this.registry.findBySlug(slug);
      return this.client.sendText(waId, `🤖 *AI Assistant activated for ${retailer?.name ?? 'this store'}!*\n\nI can help you find products, check stock, or answer questions. What are you looking for?\n\n_(Type "exit" to leave AI mode)_`);
    }

    if (action === WA_ACTION.PROD_SELECT) {
      const productId = parseInt(parts[2], 10);
      const product = await this.prisma.cachedProduct.findUnique({
        where: { storeSlug_sellerId: { storeSlug: slug, sellerId: productId } }
      });

      if (!product) {
        return this.client.sendText(waId, 'Product not found.');
      }

      // Send image if available, otherwise just text
      const detailText = this.catalogFormatter.productDetail(product, process.env.GATEWAY_PUBLIC_URL);
      
      if (product.images && product.images.length > 0) {
        // Warning: Localhost images won't work in WhatsApp API. 
        // We will send text first while building out the URL resolving flow.
        await this.client.sendText(waId, detailText);
      } else {
        await this.client.sendText(waId, detailText);
      }

      await this.client.sendInteractive(waId, buildProductDetailMenu(product, slug));
      return;
    }

    const cartUserId = `wa:${waId}`;

    if (action === WA_ACTION.CART_ADD) {
      const productId = parseInt(parts[2], 10);
      const qty = parseInt(parts[3] || '1', 10);
      const product = await this.prisma.cachedProduct.findUnique({
        where: { storeSlug_sellerId: { storeSlug: slug, sellerId: productId } }
      });
      
      if (!product) return this.client.sendText(waId, 'Product no longer available.');
      
      await this.cartService.add(cartUserId, slug, { 
        productId: product.sellerId, 
        title: product.title, 
        price: product.price || 0 
      }, qty);
      
      await this.client.sendText(waId, `✅ Added ${qty}x ${product.title} to cart.`);
      const items = await this.cartService.get(cartUserId, slug);
      await this.client.sendInteractive(waId, buildCartMenu(slug, items.length));
      return;
    }

    if (action === WA_ACTION.CART_VIEW) {
      if (parts[2] === 'clear') {
        await this.cartService.clear(cartUserId, slug);
        await this.client.sendText(waId, '🗑 Cart cleared.');
      }
      
      const items = await this.cartService.get(cartUserId, slug);
      const total = await this.cartService.total(cartUserId, slug);
      const retailer = await this.registry.findBySlug(slug);
      const storeName = retailer ? retailer.name : 'Store';
      
      await this.client.sendText(waId, this.catalogFormatter.cartSummary(storeName, items, total));
      await this.client.sendInteractive(waId, buildCartMenu(slug, items.length));
      return;
    }

    if (action === WA_ACTION.CHECKOUT) {
      const items = await this.cartService.get(cartUserId, slug);
      if (items.length === 0) {
        return this.client.sendText(waId, 'Your cart is empty.');
      }
      return this.handleCheckout(waId, slug);
    }

    if (action === WA_ACTION.ADDR_SELECT) {
      const addressId = parseInt(parts[2], 10);
      const address = await this.prisma.whatsAppAddress.findUnique({ where: { id: addressId } });
      if (!address) return this.client.sendText(waId, 'Address error.');
      
      await this.sessionService.setSession(waId, 'main', { 
        storeSlug: slug, 
        step: 'payment',
        address: `${address.streetLine}, ${address.city}, ${address.province}`
      });
      return this.showPaymentMenu(waId, slug);
    }

    if (action === WA_ACTION.CAT_MENU) {
      const retailer = await this.registry.findBySlug(slug);
      if (!retailer) return this.client.sendText(waId, 'Store not found.');
      return this.client.sendInteractive(waId, buildStoreMainMenu(retailer.name, slug));
    }

    if (action === WA_ACTION.ADDR_NEW) {
      await this.sessionService.setSession(waId, 'main', { storeSlug: slug, step: 'collect:name' });
      return this.client.sendText(waId, 'Sure! Let\'s setup a new delivery address.\n\nFirst, what is your *Full Name*?');
    }

    if (action === 'pay_sel') {
      const method = parts[2];
      const session = await this.sessionService.getSession<any>(waId, 'main');
      await this.sessionService.setSession(waId, 'main', { ...session, paymentMethod: method, step: 'confirm' });
      
      const items = await this.cartService.get(cartUserId, slug);
      const total = await this.cartService.total(cartUserId, slug);
      const summary = this.catalogFormatter.cartSummary('Review Order', items, total);
      
      const confirmText = `${summary}\n\n📍 *Delivery Address:*\n${session.address}\n\n💳 *Payment:*\n${method.toUpperCase()}\n\nReply with "place order" to confirm!`;
      return this.client.sendText(waId, confirmText);
    }
  }

  private async handleCheckout(waId: string, slug: string) {
    const user = await this.prisma.whatsAppUser.findUnique({
      where: { id: waId },
      include: { addresses: true }
    });

    if (user && user.addresses.length > 0) {
      return this.client.sendInteractive(waId, buildAddressSelectMenu(slug, user.addresses));
    } else {
      await this.sessionService.setSession(waId, 'main', { storeSlug: slug, step: 'collect:name' });
      return this.client.sendText(waId, 'Let\'s get your shipping details.\n\nWhat is your *Full Name*?');
    }
  }

  private async showPaymentMenu(waId: string, slug: string) {
    const retailer = await this.registry.findBySlug(slug);
    if (!retailer) return this.client.sendText(waId, 'Store error.');
    
    let methods: string[] = ['cod'];
    try {
      methods = JSON.parse(retailer.paymentMethods);
    } catch { /* use default cod */ }
    
    return this.client.sendInteractive(waId, buildPaymentMenu(slug, methods));
  }

  /** Send a standard text message (used by ConversationService/Admin) */
  async sendMessage(waId: string, text: string): Promise<void> {
    await this.client.sendText(waId, text);
  }
}
