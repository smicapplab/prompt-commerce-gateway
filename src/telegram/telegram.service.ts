import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Optional, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { Bot, InlineKeyboard } from 'grammy';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';
import { RegistryService } from '../registry/registry.service';
import { SettingsService } from '../settings/settings.service';
import { CatalogService } from '../catalog/catalog.service';
import { callRetailerTool } from '../mcp/retailer-client';
import { AiChatService, type StoreAiConfig, type ChatResult } from './ai-chat.service';
import { TelegramSessionService } from './telegram-session.service';
import { CartService } from './cart.service';
import { ConversationService } from '../chat/conversation.service';
import { PaymentService } from '../payments/payment.service';
import { CatalogFormatter } from '../catalog/catalog-formatter';
import { buildAiChatFooter } from '../shared/ai-chat-shell';
import { AddressPickerService } from '../address-picker/address-picker.service';
import { CB, storeListKeyboard, storeMenuKeyboard, categoryKeyboard,
         productListKeyboard, productDetailKeyboard, productDetailSearchKeyboard, productDetailAiKeyboard,
         cartKeyboard, emptyCartKeyboard, aiModeKeyboard, aiProductKeyboard,
         backKeyboard, quantityKeyboard } from './keyboards';
import { esc, price, productDetail, cartSummary, orderConfirmation,
         welcomeMessage, storeMenuMessage } from './formatters';

const PAGE_SIZE = 5;

// ─── Checkout session state ───────────────────────────────────────────────────
interface CheckoutState {
  storeSlug:     string;
  step:          'name' | 'email' | 'addressList' | 'addressPicker' | 'freeAddress' | 'labelType' | 'delivery' | 'payment' | 'confirm';
  name?:         string;
  email?:        string;
  
  // New address flow state
  province?:     string;
  city?:         string;
  barangay?:     string;
  streetLine?:   string;
  postalCode?:   string;
  addressId?:    number;
  lat?:          number;
  lng?:          number;

  address?:      string;
  deliveryType?: 'delivery' | 'pickup';
  paymentMethod?: string;  // e.g. 'cod', 'mock', 'assisted', 'paymongo', 'stripe'
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot | null = null;
  private webhookMode = false;
  private webhookSecret = '';

  // Per-user session maps (in-memory)
  private checkoutSessions = new Map<string, CheckoutState>();
  private searchQueries    = new Map<string, string>();  // userId → last search query
  private lastStoreSlug    = new Map<string, string>();  // userId → most recently visited store slug
  private resultsState     = new Map<string, { messageIds: number[] }>(); // userId -> product card message IDs

  constructor(
    private readonly registry: RegistryService,
    private readonly settings: SettingsService,
    private readonly catalog: CatalogService,
    private readonly aiChat: AiChatService,
    private readonly cartService: CartService,
    private readonly telegramSession: TelegramSessionService,
    private readonly conversationService: ConversationService,
    private readonly catalogFormatter: CatalogFormatter,
    private readonly addressPicker: AddressPickerService,
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Optional() private readonly paymentService?: PaymentService,
  ) {}

  // ─── User sync ──────────────────────────────────────────────────────────────
  private async syncUser(ctx: any): Promise<string | null> {
    const userId = ctx.from?.id.toString();
    if (!userId) return null;

    try {
      await this.prisma.telegramUser.upsert({
        where: { id: userId },
        create: {
          id: userId,
          username: ctx.from?.username,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name,
        },
        update: {
          username: ctx.from?.username,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name,
        },
      });
    } catch (err) {
      this.logger.error(`User sync failed for ${userId}: ${err}`);
    }

    return userId;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  async onModuleInit(): Promise<void> {
    await this.initBot();

    // Prune in-memory session maps every hour to prevent memory leaks.
    // These maps hold non-critical transient state.
    setInterval(() => {
      this.checkoutSessions.clear();
      this.searchQueries.clear();
      this.lastStoreSlug.clear();
      this.resultsState.clear();
      this.logger.log('Pruned in-memory Telegram sessions.');
    }, 60 * 60 * 1000).unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.bot && !this.webhookMode) {
      await this.bot.stop();
    }
  }

  // ─── Bot initialisation (supports hot-reload on config change) ───────────────
  async initBot(): Promise<void> {
    // Gracefully stop existing polling bot before reinitialising
    if (this.bot && !this.webhookMode) {
      try { await this.bot.stop(); } catch { /* ignore */ }
    }
    this.bot = null;

    // Load bot token from DB first; fall back to env var for local dev
    const token = (await this.settings.get('telegram_bot_token'))
      ?? process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      this.logger.warn(
        'Telegram bot token not found in DB (key: telegram_bot_token) or TELEGRAM_BOT_TOKEN env. Bot disabled.'
      );
      return;
    }

    this.bot = new Bot(token);
    this.registerHandlers();

    // Register command menu shown in Telegram UI
    await this.bot.api.setMyCommands([
      { command: 'search',  description: 'Search products across all stores' },
      { command: 'stores',  description: 'Browse stores' },
      { command: 'cart',    description: 'View your cart' },
      { command: 'help',    description: 'Show help' },
      { command: 'myid',    description: 'Show your Telegram chat ID (for store owners)' },
    ]);

    const webhookUrl = (await this.settings.get('telegram_webhook_url'))?.trim();

    if (webhookUrl) {
      // ── Webhook mode ────────────────────────────────────────────────────────
      this.webhookSecret = await this.ensureWebhookSecret();
      await this.bot.api.setWebhook(webhookUrl, { secret_token: this.webhookSecret });
      this.webhookMode = true;
      this.logger.log(`Telegram bot started (webhook → ${webhookUrl})`);
    } else {
      // ── Polling mode ────────────────────────────────────────────────────────
      // Delete any stale webhook before starting polling
      await this.bot.api.deleteWebhook({ drop_pending_updates: false });
      this.webhookMode = false;
      this.bot.start({ onStart: () => this.logger.log('Telegram bot started (polling).') });
    }
  }

  // ─── Webhook helpers ─────────────────────────────────────────────────────────

  /** Called by WebhookController for each incoming Telegram update. */
  async handleUpdate(update: unknown): Promise<void> {
    if (!this.bot || !this.webhookMode) return;
    await this.bot.handleUpdate(update as any);
  }

  /** Validates the secret token Telegram sends in X-Telegram-Bot-Api-Secret-Token. */
  validateWebhookSecret(token: string): boolean {
    if (!this.webhookSecret || !token) return false;
    
    // L1: The stored webhookSecret is a hash. We hash the incoming token and compare.
    const incomingHash = crypto.createHash('sha256').update(token).digest('hex');
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(incomingHash),
        Buffer.from(this.webhookSecret)
      );
    } catch {
      return false;
    }
  }

  /** Returns current mode + live webhook info from Telegram API. */
  async getWebhookStatus(): Promise<Record<string, unknown>> {
    if (!this.bot) return { mode: 'disabled', enabled: false };
    try {
      const info = await this.bot.api.getWebhookInfo();
      return {
        mode:    this.webhookMode ? 'webhook' : 'polling',
        enabled: true,
        ...info,
      };
    } catch {
      return { mode: this.webhookMode ? 'webhook' : 'polling', enabled: true };
    }
  }

  private async ensureWebhookSecret(): Promise<string> {
    const stored = await this.settings.get('telegram_webhook_secret');
    
    // If already stored, we treat it as the hashed version.
    // NOTE: This will break once if you have a plaintext secret stored, 
    // but re-initialising the bot (save TG settings) will fix it.
    if (stored) return stored;

    // Generate a fresh secret, but store the HASH of it (L1)
    const plaintext = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(plaintext).digest('hex');
    
    await this.settings.set('telegram_webhook_secret', hashed);
    
    // We must return the PLAINTEXT to pass to setWebhook()
    return plaintext;
  }

  // ─── Handler registration ───────────────────────────────────────────────────
  private registerHandlers(): void {
    if (!this.bot) return;
    const bot = this.bot;

    // ── /start ─────────────────────────────────────────────────────────────
    bot.command('start', async (ctx) => {
      await this.syncUser(ctx);
      const firstName = ctx.from?.first_name ?? 'there';
      const stores = await this.registry.findActiveRetailers();

      if (!stores.length) {
        await ctx.reply('No stores are currently available. Please check back later.');
        return;
      }

      await ctx.reply(welcomeMessage(firstName), {
        parse_mode: 'HTML',
        reply_markup: storeListKeyboard(stores.map(s => ({ slug: s.slug, name: s.name }))),
      });
    });

    // ── /stores ────────────────────────────────────────────────────────────
    bot.command('stores', async (ctx) => {
      await this.syncUser(ctx);
      const stores = await this.registry.findActiveRetailers();
      this.logger.log(`Found ${stores.length} active retailers: ${stores.map(s => s.slug).join(', ')}`);
      if (!stores.length) {
        await ctx.reply('No stores available right now.');
        return;
      }
      await ctx.reply('Select a store:', {
        reply_markup: storeListKeyboard(stores.map(s => ({ slug: s.slug, name: s.name }))),
      });
    });

    // ── /cart ──────────────────────────────────────────────────────────────
    bot.command('cart', async (ctx) => {
      const userId = await this.syncUser(ctx);
      if (!userId) return;

      // Resolve store: active session → last viewed store → prompt user
      const aiSession = await this.telegramSession.getSession(userId, 'ai');
      const slug =
        aiSession?.storeSlug ??
        this.checkoutSessions.get(userId)?.storeSlug ??
        this.lastStoreSlug.get(userId);

      if (!slug) {
        await ctx.reply('Please select a store first with /stores.');
        return;
      }
      await this.sendCart(ctx, userId, slug);
    });

    // ── /search ────────────────────────────────────────────────────────────
    bot.command('search', async (ctx) => {
      const query = ctx.match?.trim();
      if (!query) {
        await ctx.reply(
          'What are you looking for?\n\n' +
          'You can search naturally, for example:\n' +
          '  <b>/search laptop under 50k</b>\n' +
          '  <b>/search shoes between 500 and 2000</b>\n' +
          '  <b>/search in stock headphones</b>\n\n' +
          'Or just type a product name directly.',
          { parse_mode: 'HTML' },
        );
        return;
      }
      const userId = await this.syncUser(ctx);
      if (userId) this.searchQueries.set(userId, query);
      await this.sendSearchResults(ctx, query, 0);
    });

    // ── /help ──────────────────────────────────────────────────────────────
    bot.command('help', async (ctx) => {
      await this.syncUser(ctx);
      await ctx.reply(
        '<b>Prompt Commerce Bot</b>\n\n' +
        '<b>Search</b>\n' +
        '/search &lt;query&gt; — Search across all stores\n' +
        'You can include filters naturally:\n' +
        '  • <i>laptop under 50k</i>\n' +
        '  • <i>shoes between 500 and 2000</i>\n' +
        '  • <i>in stock headphones below 3000</i>\n' +
        '  • <i>more than 1000 bags</i>\n\n' +
        '<b>Browse</b>\n' +
        '/stores — Browse by store\n' +
        '/cart — View your cart\n' +
        '/help — This message\n\n' +
        'Or just type anything to search instantly.',
        { parse_mode: 'HTML' },
      );
    });

    // ── /myid ──────────────────────────────────────────────────────────────
    bot.command('myid', async (ctx) => {
      await this.syncUser(ctx);
      const chatId = ctx.chat?.id.toString();
      await ctx.reply(
        `🆔 <b>Your Telegram Chat ID:</b> <code>${chatId}</code>\n\n` +
        `Store owners can use this ID in the seller admin panel under\n` +
        `<i>Settings → Telegram → Notification Chat ID</i> to receive\n` +
        `order notifications for their store.`,
        { parse_mode: 'HTML' },
      );
    });

    // ── Callback queries ───────────────────────────────────────────────────
    bot.on('callback_query:data', async (ctx) => {
      const data = ctx.callbackQuery.data;
      const userId = await this.syncUser(ctx);
      if (!userId) return;

      // Answer immediately to clear the button spinner for all callbacks EXCEPT
      // add-to-cart, which needs to answer last so it can show a toast message.
      if (!data.startsWith('a:')) {
        await ctx.answerCallbackQuery();
      }

      try {
        // s:<slug> — store selected
        if (data.startsWith('s:')) {
          const slug = data.slice(2);
          await this.telegramSession.deleteSession(userId, 'ai');
          this.checkoutSessions.delete(userId);
          const retailer = await this.registry.findBySlug(slug);
          await ctx.editMessageText(storeMenuMessage(retailer.name), {
            parse_mode: 'HTML',
            reply_markup: storeMenuKeyboard(slug),
          });
          return;
        }

        // bk:<slug> — back to store menu
        if (data.startsWith('bk:')) {
          const slug = data.slice(3);
          await this.telegramSession.deleteSession(userId, 'ai');
          const retailer = await this.registry.findBySlug(slug);
          await this.safeEditText(ctx, storeMenuMessage(retailer.name), {
            parse_mode: 'HTML',
            reply_markup: storeMenuKeyboard(slug),
          });
          return;
        }

        // cats:<slug> — list categories
        if (data.startsWith('cats:')) {
          const slug = data.slice(5);
          await this.sendCategories(ctx, slug);
          return;
        }

        // delivery:<type>:<slug> — delivery type selected
        if (data.startsWith('delivery:')) {
          const firstColon  = data.indexOf(':');
          const secondColon = data.indexOf(':', firstColon + 1);
          const type = data.slice(firstColon + 1, secondColon);
          const slug = data.slice(secondColon + 1);

          const state = this.checkoutSessions.get(userId);
          if (!state || state.storeSlug !== slug) return;

          state.deliveryType = type as 'delivery' | 'pickup';
          state.step = 'payment';
          this.checkoutSessions.set(userId, state);

          const retailer = await this.getRetailer(slug);
          await this.showPaymentSelection(ctx, slug, retailer);
          return;
        }

        // pmnt:<method>:<slug> — payment method selected
        if (data.startsWith('pmnt:')) {
          const firstColon  = data.indexOf(':');
          const secondColon = data.indexOf(':', firstColon + 1);
          const method = data.slice(firstColon + 1, secondColon);
          const slug = data.slice(secondColon + 1);

          const state = this.checkoutSessions.get(userId);
          if (!state || state.storeSlug !== slug) return;

          state.paymentMethod = method;
          state.step = 'confirm';
          this.checkoutSessions.set(userId, state);

          const retailer = await this.getRetailer(slug);
          await this.showOrderSummary(ctx, userId, slug, state, true, retailer);
          return;
        }
        // addr:
        if (data.startsWith('addr:')) {
          const action = data.slice(5);
          const state = this.checkoutSessions.get(userId);
          if (!state) return;
          if (action === 'new') {
            state.step = 'freeAddress';
            this.checkoutSessions.set(userId, state);
            await ctx.editMessageText('📍 Please type your full delivery address:\n<i>(e.g. "123 Main St, Barangay San Jose, Makati City, Metro Manila")</i>', { parse_mode: 'HTML' });
            return;
          }
          // Select existing
          const id = parseInt(action);
          const addr = await this.prisma.telegramAddress.findUnique({ where: { id } });
          if (addr && addr.userId === userId) {
            // Promote to default (most recently used)
            await this.prisma.telegramAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
            await this.prisma.telegramAddress.update({ where: { id }, data: { isDefault: true } });

            state.addressId = id;
            state.province = addr.province;
            state.city = addr.city;
            state.barangay = addr.barangay || '';
            state.streetLine = addr.streetLine;
            state.postalCode = addr.postalCode || '';
            state.lat = Number(addr.lat) || undefined;
            state.lng = Number(addr.lng) || undefined;
            state.address = [addr.streetLine, addr.barangay, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ');
            
            const retailer = await this.getRetailer(state.storeSlug);
            if (retailer.allowsPickup) {
              state.step = 'delivery';
              const deliveryKb = new InlineKeyboard()
                .text('🏠 Home Delivery', `delivery:delivery:${state.storeSlug}`)
                .text('🏪 Store Pickup',  `delivery:pickup:${state.storeSlug}`);
              await ctx.editMessageText('🚚 How would you like to receive your order?', { reply_markup: deliveryKb });
            } else {
              state.step = 'payment';
              state.deliveryType = 'delivery';
              await ctx.deleteMessage().catch(() => {});
              await this.showPaymentSelection(ctx, state.storeSlug, retailer);
            }
            this.checkoutSessions.set(userId, state);
          }
          return;
        }
        
        // lbl:
        if (data.startsWith('lbl:')) {
          const lbl = data.slice(4);
          const state = this.checkoutSessions.get(userId);
          if (state?.step === 'labelType') {
            await this.saveAndApplyAddress(ctx, userId, state, lbl === 'skip' ? '' : lbl, true);
          }
          return;
        }

        // c:<slug>:<catId> — products in category
        if (data.startsWith('c:')) {
          const parts = data.split(':');
          if (parts.length < 3) return;
          const [, slug, catId] = parts;
          await this.sendProducts(ctx, slug, parseInt(catId), 0);
          return;
        }

        // pg:<slug>:<catId>:<page> — paginate products
        if (data.startsWith('pg:')) {
          const parts = data.split(':');
          if (parts.length < 4) return;
          const slug = parts[1];
          const catId = parts[2];
          const page  = parseInt(parts[3]);
          await this.sendProducts(ctx, slug, catId === 'all' ? 'all' : parseInt(catId), page);
          return;
        }

        // p:<slug>:<productId> — product detail
        if (data.startsWith('p:')) {
          const parts = data.split(':');
          if (parts.length < 3) return;
          const [, slug, productId] = parts;
          await this.sendProductDetail(ctx, slug, parseInt(productId));
          return;
        }

        // a:<slug>:<productId>:<qty> — add to cart
        if (data.startsWith('a:')) {
          const parts = data.split(':');
          if (parts.length < 3) return;
          const [, slug, productId, qtyStr] = parts;
          // Guard quantity between 1 and 99 (Finding #11)
          const qty = Math.max(1, Math.min(99, qtyStr ? parseInt(qtyStr) : 1));
          await this.addToCart(ctx, userId, slug, parseInt(productId), qty);
          return;
        }

        // qty:<slug>:<productId> — ask for quantity
        if (data.startsWith('qty:')) {
          const parts = data.split(':');
          if (parts.length < 3) return;
          const [, slug, productId] = parts;
          await ctx.editMessageReplyMarkup({ reply_markup: quantityKeyboard(slug, parseInt(productId)) });
          return;
        }

        // r:<slug>:<productId> — remove from cart
        if (data.startsWith('r:')) {
          const parts = data.split(':');
          if (parts.length < 3) return;
          const [, slug, productId] = parts;
          await this.cartService.remove(userId, slug, parseInt(productId));
          await this.sendCart(ctx, userId, slug);
          return;
        }

        // cart:<slug> — view cart
        if (data.startsWith('cart:')) {
          const slug = data.slice(5);
          await this.sendCart(ctx, userId, slug);
          return;
        }

        // chk:<slug> — start checkout
        if (data.startsWith('chk:')) {
          const slug = data.slice(4);
          await this.startCheckout(ctx, userId, slug);
          return;
        }

        // ai:<slug> — enter AI mode
        if (data.startsWith('ai:')) {
          const slug = data.slice(3);
          await this.telegramSession.setSession(userId, 'ai', { storeSlug: slug });
          const retailer = await this.registry.findBySlug(slug);
          await this.safeEditText(ctx, this.catalogFormatter.formatAiGreeting(retailer.name, 'html'), {
            parse_mode: 'HTML',
            reply_markup: aiModeKeyboard(slug),
          });
          return;
        }

        // confirm:<slug> — place the order
        if (data.startsWith('confirm:')) {
          const slug = data.slice(8);
          await this.confirmOrder(ctx, userId, slug);
          return;
        }

        // cancel:<slug> — abort checkout (preserves cart so the user can retry)
        if (data.startsWith('cancel:')) {
          const slug = data.slice(7);
          this.checkoutSessions.delete(userId);
          const retailer = await this.registry.findBySlug(slug);
          await ctx.editMessageText(
            `Checkout cancelled. Your cart is still saved — tap 🛒 View Cart to continue.\n\n${storeMenuMessage(retailer.name)}`,
            { parse_mode: 'HTML', reply_markup: storeMenuKeyboard(slug) },
          );
          return;
        }

        // srch:<offset> — paginate cross-store search results
        if (data.startsWith('srch:')) {
          const offset = parseInt(data.slice(5)) || 0;
          const query  = this.searchQueries.get(userId);
          if (!query) { await ctx.reply('Search expired. Send /search again.'); return; }
          await this.sendSearchResults(ctx, query, offset, true);
          return;
        }

      } catch (err) {
        this.logger.error(`Callback error [${data}]: ${err}`);
        await ctx.reply('Something went wrong. Please try again.');
      }
    });

    // ── Text messages ──────────────────────────────────────────────────────
    bot.on('message:text', async (ctx) => {
      const userId = await this.syncUser(ctx);
      if (!userId) return;
      let text = ctx.message.text;

      // M1: Guard against excessively long messages (10KB limit in TG, but we want to cap for AI/DB)
      const MAX_LENGTH = 4000;
      if (text.length > MAX_LENGTH) {
        this.logger.warn(`User ${userId} sent long message (${text.length} chars). Truncating.`);
        text = text.slice(0, MAX_LENGTH);
        await ctx.reply('⚠️ <b>Message too long</b>\nYour message was truncated to 4,000 characters to process it effectively.', { parse_mode: 'HTML' });
      }

      const lowerText = text.toLowerCase();

      // Check for human handover keywords (strictly phrases to avoid accidental triggers)
      const humanKeywords = [
        '/human', '/agent', 'talk to a person', 'speak to a person', 
        'connect me to a human', 'talk to a human', 'speak to a human',
        'chat with a person', 'connect me to an agent'
      ];
      const isRequestingHuman = humanKeywords.some(k => lowerText.includes(k));

      if (isRequestingHuman) {
        // Resolve active store session
        const aiSession = await this.telegramSession.getSession(userId, 'ai');
        const slug =
          aiSession?.storeSlug ??
          this.checkoutSessions.get(userId)?.storeSlug ??
          this.lastStoreSlug.get(userId);
        if (slug) {
          const conv = await this.conversationService.getOrCreate(String(userId), ctx.from.first_name || 'Buyer', slug);
          if (conv.mode === 'ai') {
            await this.conversationService.setMode(conv.id, 'human');
            await this.conversationService.logMessage(conv.id, slug, 'system', 'Buyer requested a human agent via keyword', undefined, false, conv);
            await ctx.reply('Hang tight! I\'ve notified a store representative to join the chat. Someone will be with you shortly.');
            return;
          }
        }
      }

      if (text.startsWith('/')) return; // skip commands

      // Checkout flow
      const checkoutState = this.checkoutSessions.get(userId);
      if (checkoutState) {
        await this.handleCheckoutInput(ctx, userId, text, checkoutState);
        return;
      }

      // AI mode
      const aiState = await this.telegramSession.getSession(userId, 'ai');
      if (aiState) {
        await this.handleAiMessage(ctx, userId, text, aiState.storeSlug);
        return;
      }

      // Default — treat free text as a product search across all stores
      if (userId) this.searchQueries.set(userId, text);
      await this.sendSearchResults(ctx, text, 0);
    });

    // ── Error handler ──────────────────────────────────────────────────────
    bot.catch((err) => {
      this.logger.error('Bot error:', err);
    });
  }

  /** Send a message to a specific user/chat ID */
  async sendMessage(chatId: string | number, text: string, options: any = {}): Promise<void> {
    if (!this.bot) throw new Error('Bot not initialised');
    await this.bot.api.sendMessage(chatId, text, { parse_mode: 'HTML', ...options });
  }

  async handlePickerAddress(userId: string, storeSlug: string, address: any) {
    const state = this.checkoutSessions.get(userId);
    if (!state || state.storeSlug !== storeSlug) return;

    // Sanitize and cap input lengths
    const clean = {
      streetLine:       String(address.streetLine  || '').slice(0, 200),
      barangay:         String(address.barangay    || '').slice(0, 100),
      city:             String(address.city        || '').slice(0, 100),
      province:         String(address.province    || '').slice(0, 100),
      postalCode:       String(address.postalCode  || '').slice(0, 20),
      formattedAddress: String(address.formattedAddress || '').slice(0, 300),
      lat:  typeof address.lat === 'number' ? address.lat : null,
      lng:  typeof address.lng === 'number' ? address.lng : null,
    };

    // Update session state
    state.province = clean.province;
    state.city = clean.city;
    state.barangay = clean.barangay;
    state.streetLine = clean.streetLine;
    state.postalCode = clean.postalCode;
    state.address = clean.formattedAddress;
    state.lat = clean.lat;
    state.lng = clean.lng;
    state.step = 'labelType';
    this.checkoutSessions.set(userId, state);

    if (this.bot) {
      await this.bot.api.sendMessage(userId, `✅ <b>Address confirmed:</b>\n${clean.formattedAddress}`, { parse_mode: 'HTML' });
      
      const kb = new InlineKeyboard()
        .text('🏠 Home', 'lbl:Home')
        .text('🏢 Office', 'lbl:Office').row()
        .text('❌ Don\'t save, just use once', 'lbl:skip');
      
      await this.bot.api.sendMessage(userId, '💾 <b>Save Address As:</b>\n\nChoose a label, or type your own custom label (e.g. "Condo").', { 
        parse_mode: 'HTML', 
        reply_markup: kb 
      });
    }
  }

  async handlePickerCancelled(userId: string, storeSlug: string) {
    const state = this.checkoutSessions.get(userId);
    if (!state || state.storeSlug !== storeSlug) return;

    state.step = 'freeAddress';
    this.checkoutSessions.set(userId, state);

    if (this.bot) {
      await this.bot.api.sendMessage(userId, 
        '📍 No problem! Please type your full delivery address:\n' +
        '<i>(e.g. "123 Main St, Barangay San Jose, Makati City, Metro Manila")</i>',
        { parse_mode: 'HTML' }
      );
    }
  }

  // ─── Cross-store product search ─────────────────────────────────────────────
  private async sendSearchResults(
    ctx: any,
    rawQuery: string,
    offset: number,
    edit = false,
  ): Promise<void> {
    const PAGE = 5;
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;

    // ── 1. Delete previous messages if paginating (Issue 1b) ──────────────────
    if (userId && chatId && edit) {
      const state = this.resultsState.get(userId);
      if (state) {
        for (const msgId of state.messageIds) {
          try { await this.bot!.api.deleteMessage(chatId, msgId); } catch {}
        }
        this.resultsState.delete(userId);
      }
      // Delete the pagination message itself
      try { await ctx.deleteMessage(); } catch {}
    }

    const { results, total, parsed, fallback } = await this.catalog.smartSearch(rawQuery, { limit: PAGE, offset });
    const { keywords, maxPrice, minPrice, inStockOnly } = parsed;

    // ── 2. Build header/filter labels ────────────────────────────────────────
    const ph = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
    const filters: string[] = [];
    if (keywords)                 filters.push(`<b>${esc(keywords)}</b>`);
    if (minPrice != null && maxPrice != null)
                                  filters.push(`${ph(minPrice)}–${ph(maxPrice)}`);
    else if (minPrice != null)    filters.push(`from ${ph(minPrice)}`);
    else if (maxPrice != null)    filters.push(`under ${ph(maxPrice)}`);
    if (inStockOnly)              filters.push('in stock');

    const label = filters.length ? filters.join(' · ') : 'all products';
    const fallbackNote = fallback ? '\n<i>💡 No exact matches — showing similar results</i>' : '';

    if (!results.length && offset === 0) {
      const msg = `🔍 No products found for ${label}.\n\nTry a different keyword or browse by /stores.`;
      await ctx.reply(msg, { parse_mode: 'HTML' });
      return;
    }

    // Cart context for shortcut button
    const aiSession = userId ? await this.telegramSession.getSession(userId, 'ai') : null;
    const cartSlug = userId
      ? (aiSession?.storeSlug ?? this.lastStoreSlug.get(userId))
      : undefined;

    const hasPrev = offset > 0;
    const hasNext = offset + PAGE < total;
    const currentPage = Math.floor(offset / PAGE) + 1;
    const totalPages = Math.ceil(total / PAGE);

    const newMessageIds: number[] = [];

    // ── 3. Render Photo Cards (Issue 1b) ──────────────────────────────────────
    for (let i = 0; i < results.length; i++) {
      const p = results[i];
      
      // Page info only on the last card
      const pageInfo = (i === results.length - 1) 
        ? `Page ${currentPage} of ${totalPages} · ${total} results`
        : undefined;
      
      // Header info only on the first card
      const headerPrefix = (i === 0)
        ? `🛍 <b>Search results:</b> ${label}${fallbackNote}\n\n`
        : '';

      const caption = headerPrefix + this.catalogFormatter.productCard(
        {
          title: p.title,
          price: p.price,
          stockQuantity: p.stockQuantity,
          description: p.description,
          storeName: p.storeSlug,
          sku: p.sku
        },
        'html',
        { showStore: true, pageInfo }
      );

      // Get cart qty for badge (Issue 1b)
      let cartQty = 0;
      if (userId && p.storeSlug) {
        cartQty = await this.cartService.getItemQty(userId, p.storeSlug, p.sellerId);
      }
      const addLabel = cartQty > 0 ? `🛒 Add More (${cartQty})` : '🛒 Add to Cart';

      const cardKeyboard = new InlineKeyboard()
        .text(addLabel, CB.qty(p.storeSlug, p.sellerId))
        .text('📋 Details', CB.prod(p.storeSlug, p.sellerId));

      const imageUrl = await this.resolveImageUrl(p as any, p.storeSlug);

      let sentMsg;
      if (imageUrl?.startsWith('http')) {
        try {
          sentMsg = await ctx.replyWithPhoto(imageUrl, {
            caption,
            parse_mode: 'HTML',
            reply_markup: cardKeyboard,
          });
        } catch {
          sentMsg = await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: cardKeyboard });
        }
      } else {
        sentMsg = await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: cardKeyboard });
      }
      if (sentMsg) newMessageIds.push(sentMsg.message_id);
    }

    // ── 4. Navigation footer message ──────────────────────────────────────────
    const navKeyboard = new InlineKeyboard();
    if (hasPrev) navKeyboard.text('← Prev', `srch:${offset - PAGE}`);
    if (hasNext) navKeyboard.text('Next →', `srch:${offset + PAGE}`);
    
    if (cartSlug) {
      if (hasPrev || hasNext) navKeyboard.row();
      const cartItems = await this.cartService.get(userId!, cartSlug);
      const cartLabel = cartItems.length > 0 ? `🛍 View Cart (${cartItems.length})` : '🛍 View Cart';
      navKeyboard.text(cartLabel, CB.cart(cartSlug));
    }

    if (hasPrev || hasNext || cartSlug) {
      const footerMsg = await ctx.reply('─────────────', { reply_markup: navKeyboard });
      newMessageIds.push(footerMsg.message_id);
    }

    if (userId) {
      this.resultsState.set(userId, { messageIds: newMessageIds });
    }
  }

  // ─── Send categories ────────────────────────────────────────────────────────
  // Cache-first: reads from gateway DB if synced, falls back to seller MCP.
  private async sendCategories(ctx: any, slug: string): Promise<void> {
    let categories: Array<{ id: number; name: string }> = [];

    const cached = await this.catalog.getCategories(slug);
    if (cached.length) {
      categories = cached.map(c => ({ id: c.sellerId, name: c.name }));
    } else {
      // Fallback: live MCP call
      try {
        const retailer = await this.getRetailer(slug);
        const result = await callRetailerTool(retailer, 'list_categories', {}) as any;
        categories = JSON.parse(result?.content?.[0]?.text ?? '[]');
      } catch { /* empty */ }
    }

    if (!categories.length) {
      await this.safeEditText(
        ctx,
        `No categories found.\n\n💡 <i>Tip: sync your catalog from the seller admin panel.</i>`,
        { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
      );
      return;
    }

    await this.safeEditText(
      ctx,
      `<b>Categories</b> — choose one to browse products:`,
      { parse_mode: 'HTML', reply_markup: categoryKeyboard(slug, categories) },
    );
  }

  // ─── Send product list ──────────────────────────────────────────────────────
  // Cache-first: reads from gateway DB if synced, falls back to seller MCP.
  private async sendProducts(
    ctx: any,
    slug: string,
    catId: number | 'all',
    page: number,
  ): Promise<void> {
    const offset = page * PAGE_SIZE;
    let pageProducts: Array<{ id: number; title: string; price: number | null; stock_quantity: number }> = [];
    let hasMore = false;

    const synced = await this.catalog.isSynced(slug);
    if (synced) {
      // Read from gateway DB cache
      const rows = await this.catalog.getProducts(slug, {
        categoryId: catId !== 'all' ? catId : undefined,
        limit: PAGE_SIZE + 1,
        offset,
      });
      hasMore = rows.length > PAGE_SIZE;
      pageProducts = rows.slice(0, PAGE_SIZE).map(r => ({
        id: r.sellerId, title: r.title, price: r.price, stock_quantity: r.stockQuantity,
      }));
    } else {
      // Fallback: live MCP call
      try {
        const retailer = await this.getRetailer(slug);
        const args: Record<string, unknown> = { limit: offset + PAGE_SIZE + 1 };
        if (catId !== 'all') {
          const catResult = await callRetailerTool(retailer, 'list_categories', {}) as any;
          const cats: Array<{ id: number; name: string }> = JSON.parse(catResult?.content?.[0]?.text ?? '[]');
          const cat = cats.find(c => c.id === catId);
          if (cat) args.category = cat.name;
        }
        const result = await callRetailerTool(retailer, 'search_products', args) as any;
        const all: Array<{ id: number; title: string; price: number | null; stock_quantity: number }> =
          JSON.parse(result?.content?.[0]?.text ?? '[]');
        pageProducts = all.slice(offset, offset + PAGE_SIZE);
        hasMore = all.length > offset + PAGE_SIZE;
      } catch { /* empty */ }
    }

    if (!pageProducts.length) {
      await this.safeEditText(ctx, 'No products found.', { reply_markup: backKeyboard(slug) });
      return;
    }

    const syncNote = synced ? '' : '\n\n<i>💡 Sync catalog for faster browsing.</i>';
    const userId = ctx.from?.id.toString();
    const cartCount = userId ? (await this.cartService.get(userId, slug)).length : 0;

    await this.safeEditText(
      ctx,
      `<b>Products</b> (page ${page + 1})${syncNote}\n\n<i>Tap a product for details:</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: productListKeyboard(slug, pageProducts, catId, page, hasMore, cartCount),
      },
    );
  }

  // ─── Send product detail ────────────────────────────────────────────────────
  private async sendProductDetail(ctx: any, slug: string, productId: number): Promise<void> {
    const userId = ctx.from?.id.toString();

    // ── 1. Resolve product: gateway cache first (fast), MCP fallback ──────────
    let product: any = null;
    const cached = await this.catalog.getProduct(slug, productId);
    if (cached) {
      product = {
        id:             cached.sellerId,
        title:          cached.title,
        description:    cached.description,
        price:          cached.price,
        stock_quantity: cached.stockQuantity,
        sku:            cached.sku,
        tags:           cached.tags,
        images:         cached.images,
      };
    } else {
      // Live MCP call as fallback when product not in cache
      try {
        const retailer = await this.getRetailer(slug);
        const result   = await callRetailerTool(retailer, 'get_product', { id: productId }) as any;
        const raw      = result?.content?.[0]?.text ?? '{}';
        product = JSON.parse(raw);
      } catch { /* product stays null */ }
    }

    if (!product?.id) {
      try { await ctx.editMessageText('Product not found.', { reply_markup: backKeyboard(slug) }); }
      catch { await ctx.reply('Product not found.', { reply_markup: backKeyboard(slug) }); }
      return;
    }

    // ── 2. Track last store for /cart command ─────────────────────────────────
    if (userId) this.lastStoreSlug.set(userId, slug);

    // ── 3. Resolve image URL ──────────────────────────────────────────────────
    // The cached value may be:
    //  a) an absolute HTTPS URL  → use directly
    //  b) an absolute HTTP URL   → filtered out by sync's filterSecureImageUrls, so
    //                              cached.images[] ends up empty; handled by (c)
    //  c) a relative path        → seller_public_url was missing at sync time;
    //                              absolutise now using the store's mcpServerUrl
    let imageUrl: string | undefined = Array.isArray(product.images)
      ? product.images[0]
      : (product.image_url as string | undefined);

    if (imageUrl && !imageUrl.startsWith('http')) {
      // Relative path — build an absolute URL using the store's known public URL.
      try {
        const retailer = await this.registry.findBySlug(slug);
        const base = (retailer.mcpServerUrl ?? '').replace(/\/$/, '');
        imageUrl = base ? `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}` : undefined;
      } catch { imageUrl = undefined; }
    }

    // If still no absolute image in the cache (e.g. filtered out because the
    // seller runs on HTTP), try the live MCP call for a fresh URL.
    if (!imageUrl) {
      try {
        const retailer = await this.getRetailer(slug);
        const result   = await callRetailerTool(retailer, 'get_product', { id: productId }) as any;
        const raw      = result?.content?.[0]?.text ?? '{}';
        const mcpProd  = JSON.parse(raw);
        const mcpImg   = Array.isArray(mcpProd.images) ? mcpProd.images[0] : mcpProd.image_url;
        if (typeof mcpImg === 'string' && mcpImg.startsWith('http')) imageUrl = mcpImg;
      } catch { /* no image — proceed without */ }
    }

    // ── 4. Choose keyboard based on context ───────────────────────────────────
    // Priority: AI session > global search query > default category nav.
    let keyboard;
    const cartCount = userId ? (await this.cartService.get(userId, slug)).length : 0;
    const aiSession = userId ? await this.telegramSession.getSession(userId, 'ai') : null;

    if (aiSession) {
      keyboard = productDetailAiKeyboard(slug, productId, cartCount);
    } else if (userId && this.searchQueries.has(userId)) {
      keyboard = productDetailSearchKeyboard(slug, productId, cartCount);
    } else {
      keyboard = productDetailKeyboard(slug, productId, 'all', 0, cartCount);
    }

    // ── 5. Show product — photo if available, plain text otherwise ────────────
    if (imageUrl?.startsWith('http')) {
      // Remove the keyboard from the previous list/search message so it doesn't
      // look orphaned after we send the new photo message below.
      try { await ctx.editMessageReplyMarkup({ reply_markup: undefined }); } catch {}

      // Telegram photo captions are capped at 1 024 characters.
      // Truncate long descriptions before building the caption to stay under the limit.
      const captionProduct = {
        ...product,
        description: product.description && product.description.length > 300
          ? product.description.slice(0, 300) + '…'
          : product.description,
      };
      const caption = productDetail(captionProduct);
      await ctx.replyWithPhoto(imageUrl, { caption, parse_mode: 'HTML', reply_markup: keyboard });
    } else {
      // No image — edit the existing message in-place (keeps thread tidy).
      const msg = productDetail(product);
      try {
        await ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: keyboard });
      } catch {
        await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
      }
    }
  }

  // ─── Add to cart ────────────────────────────────────────────────────────────
  private async addToCart(ctx: any, userId: string, slug: string, productId: number, qty: number = 1): Promise<void> {
    let product: any = {};

    // Try gateway cache first (fast); fall back to live MCP call
    const cached = await this.catalog.getProduct(slug, productId);
    if (cached) {
      product = {
        id:             cached.sellerId,
        title:          cached.title,
        price:          cached.price,
        stock_quantity: cached.stockQuantity,
      };
    } else {
      try {
        const retailer = await this.getRetailer(slug);
        const result   = await callRetailerTool(retailer, 'get_product', { id: productId }) as any;
        const text     = result?.content?.[0]?.text ?? '{}';
        product = JSON.parse(text);
      } catch {
        await ctx.answerCallbackQuery('⚠️ Could not reach the store. Try again.');
        return;
      }
    }

    if (!product.id) {
      await ctx.answerCallbackQuery('Product not found.');
      return;
    }
    if (product.stock_quantity === 0) {
      await ctx.answerCallbackQuery('⚠️ This product is out of stock.');
      return;
    }

    await this.cartService.add(userId, slug, {
      productId: product.id,
      title:     product.title,
      price:     product.price ?? 0,
    }, qty);

    // Track last store so /cart command works after adding from global search
    this.lastStoreSlug.set(userId, slug);

    const total = await this.cartService.total(userId, slug);
    // Answer with a toast first (must be before any message edit)
    await ctx.answerCallbackQuery(`✅ Added! Cart total: ${price(total)}`);
    // Then update the message to show the cart so the user can see what's in it
    await this.sendCart(ctx, userId, slug);
  }

  // ─── Send cart ──────────────────────────────────────────────────────────────
  private async sendCart(ctx: any, userId: string, slug: string): Promise<void> {
    const retailer = await this.registry.findBySlug(slug);
    const items = await this.cartService.get(userId, slug);
    const total = await this.cartService.total(userId, slug);
    const text  = cartSummary(retailer.name, items, total);

    const reply_markup = items.length
      ? cartKeyboard(slug, items)
      : emptyCartKeyboard(slug);

    // Try edit first, fall back to new message
    try {
      await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup });
    } catch {
      await ctx.reply(text, { parse_mode: 'HTML', reply_markup });
    }
  }

  // ─── Checkout flow ──────────────────────────────────────────────────────────
  private async startCheckout(ctx: any, userId: string, slug: string): Promise<void> {
    if (await this.cartService.isEmpty(userId, slug)) {
      await ctx.editMessageText('Your cart is empty. Add some products first!', {
        reply_markup: emptyCartKeyboard(slug),
      });
      return;
    }

    const user = await this.prisma.telegramUser.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    const isMissingProfile = !user?.savedFirstName || !user?.savedEmail;

    if (isMissingProfile) {
      this.checkoutSessions.set(userId, { storeSlug: slug, step: 'name' });
      await ctx.reply('🛍 <b>Checkout</b>\n\nWhat\'s your first and last name?', { parse_mode: 'HTML' });
      return;
    }

    // Prefill name & email and prompt for address
    const fullName = `${user.savedFirstName} ${user.savedLastName || ''}`.trim();
    const state: CheckoutState = {
      storeSlug: slug,
      step: 'addressList',
      name: fullName,
      email: user.savedEmail || undefined,
    };
    this.checkoutSessions.set(userId, state);

    await this.promptAddressSelection(ctx, userId, user.addresses);
  }

  private async promptAddressSelection(ctx: any, userId: string, addresses: any[] = []): Promise<void> {
    const kb = new InlineKeyboard();
    const state = this.checkoutSessions.get(userId);
    if (!state) return;

    // ── Address Picker (Mini App) ──
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || await this.settings.get('google_places_api_key');
    const gatewayUrl = await this.settings.get('gateway_public_url') || 'http://localhost:3002';

    if (apiKey) {
      const pickerToken = await this.addressPicker.createPickerToken('telegram', userId, state.storeSlug);
      const webAppUrl = `${gatewayUrl}/address-picker?token=${pickerToken}`;
      kb.webApp('📍 Enter Delivery Address', webAppUrl).row();
    }

    // BUG-1 FIX: Do not set freeAddress eagerly if we have buttons to show.
    // The user should click "Enter Manually" or use the picker/saved addresses.
    if (apiKey || addresses.length > 0) {
      state.step = 'addressList';
    } else {
      state.step = 'freeAddress';
    }
    this.checkoutSessions.set(userId, state);

    // Sort so default is on top
    const sorted = [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    // Show top 4 saved addresses
    for (const addr of sorted.slice(0, 4)) {
      const labelBadge = addr.label ? `${addr.label} — ` : '';
      const brief = `${labelBadge}${addr.streetLine}, ${addr.city}`.slice(0, 40);
      kb.text(`📋 Use ${brief}`, `addr:${addr.id}`).row();
    }

    // Show "Enter Manually" or "Add New Address" only if there's an alternative (API key or saved addresses)
    if (apiKey || sorted.length > 0) {
      const manualLabel = apiKey ? '✏️ Enter Manually' : '➕ Add New Address';
      kb.text(manualLabel, 'addr:new').row();
    }
    kb.text('❌ Cancel Checkout', `cancel:${state.storeSlug}`);

    let msg = '🏠 <b>Delivery Address</b>\n\n';
    
    if (apiKey) {
      msg += 'Where should we deliver your order? Tap the button below to use our address picker.';
    } else {
      msg += 'Please type your full delivery address:\n' +
             '<i>(e.g. "123 Main St, Barangay San Jose, Makati City, Metro Manila")</i>';
    }

    if (sorted.length > 0) {
      msg += '\n\nOr choose a saved address below:';
    }

    await ctx.reply(msg, {
      parse_mode: 'HTML',
      reply_markup: kb,
    });
  }
  private async handleCheckoutInput(
    ctx: any,
    userId: string,
    text: string,
    state: CheckoutState,
  ): Promise<void> {
    const { storeSlug } = state;

    if (state.step === 'name') {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 100) {
        await ctx.reply('⚠️ Please enter a valid name (1–100 characters).');
        return;
      }
      state.name = trimmed;
      state.step = 'email';
      this.checkoutSessions.set(userId, state);
      await ctx.reply('📧 What\'s your email address?');
      return;
    }

    if (state.step === 'email') {
      const trimmed = text.trim().toLowerCase();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRe.test(trimmed) || trimmed.length > 254) {
        await ctx.reply('⚠️ That doesn\'t look like a valid email address. Please try again.');
        return;
      }
      state.email = trimmed;
      state.step = 'addressList';
      this.checkoutSessions.set(userId, state);
      
      const user = await this.prisma.telegramUser.findUnique({ where: { id: userId }, include: { addresses: true } });
      await this.promptAddressSelection(ctx, userId, user?.addresses || []);
      return;
    }

    if (state.step === 'freeAddress') {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length < 10) {
        await ctx.reply('⚠️ Please enter a complete address (at least 10 characters).');
        return;
      }
      state.streetLine = trimmed;
      state.barangay   = '';
      state.city       = '';
      state.province   = '';
      state.address    = trimmed;
      state.step       = 'labelType';
      this.checkoutSessions.set(userId, state);

      const kb = new InlineKeyboard()
        .text('🏠 Home', 'lbl:Home')
        .text('🏢 Office', 'lbl:Office').row()
        .text('❌ Don\'t save, just use once', 'lbl:skip');
      await ctx.reply('💾 <b>Save Address As:</b>', { parse_mode: 'HTML', reply_markup: kb });
      return;
    }

    if (state.step === 'labelType') {
      await this.saveAndApplyAddress(ctx, userId, state, text.trim());
      return;
    }
  }

  private async saveAndApplyAddress(ctx: any, userId: string, state: CheckoutState, label: string, isEdit = false): Promise<void> {
    const province = state.province || '';
    const city     = state.city     || '';
    const barangay = state.barangay || '';

    // Save to DB if labeling (don't save if label is 'skip')
    if (label && label !== 'skip') {
      const addressCount = await this.prisma.telegramAddress.count({
        where: { userId }
      });

      const addressRecord = await this.prisma.telegramAddress.create({
        data: {
          userId: userId,
          label: label.slice(0, 50),
          streetLine: state.streetLine!,
          barangay,
          city,
          province,
          postalCode: state.postalCode ?? null,
          lat: state.lat ?? null,
          lng: state.lng ?? null,
          isDefault: addressCount === 0
        }
      });
      state.addressId = addressRecord.id;
    }

    state.address = [state.streetLine, barangay, city, province, state.postalCode].filter(Boolean).join(', ');
    const retailer = await this.getRetailer(state.storeSlug);
    if (retailer.allowsPickup) {
      state.step = 'delivery';
      this.checkoutSessions.set(userId, state);
      
      const deliveryKb = new InlineKeyboard()
        .text('🏠 Home Delivery', `delivery:delivery:${state.storeSlug}`)
        .text('🏪 Store Pickup',  `delivery:pickup:${state.storeSlug}`);
        
      const msg = '🚚 How would you like to receive your order?';
      if (isEdit) await ctx.editMessageText(msg, { reply_markup: deliveryKb });
      else await ctx.reply(msg, { reply_markup: deliveryKb });
      return;
    }

    state.step = 'payment';
    state.deliveryType = 'delivery';
    this.checkoutSessions.set(userId, state);
    if (isEdit) await ctx.deleteMessage().catch(() => {});
    await this.showPaymentSelection(ctx, state.storeSlug, retailer);
  }

  private async showOrderSummary(ctx: any, userId: string, storeSlug: string, state: CheckoutState, isEdit = false, retailer?: any): Promise<void> {
    // ── Refresh prices before confirmation ────────────────────────────────
    const { changed, oldTotal, newTotal } = await this.cartService.validateCartPrices(userId, storeSlug);
    if (changed) {
      const msg = `⚠️ <b>Note:</b> Some items in your cart have changed in price or availability. ` +
                  `Your order total has been updated from ${price(oldTotal)} to <b>${price(newTotal)}</b>.`;
      if (isEdit) await ctx.reply(msg, { parse_mode: 'HTML' });
      else await ctx.reply(msg, { parse_mode: 'HTML' });
    }

    const items = await this.cartService.get(userId, storeSlug);
    if (items.length === 0) {
      await ctx.reply('Your cart is now empty. Please add items before checking out.');
      this.checkoutSessions.delete(userId);
      return;
    }
    const total = await this.cartService.total(userId, storeSlug);
    const summary = items.map(i => `• ${i.title} × ${i.quantity} — ${price(i.price * i.quantity)}`).join('\n');

    const confirmKb = new InlineKeyboard()
      .text('✅ Confirm Order', `confirm:${storeSlug}`)
      .text('❌ Cancel',        `cancel:${storeSlug}`);

    const deliveryIcon = state.deliveryType === 'pickup' ? '🏪' : '🏠';
    const deliveryText = state.deliveryType === 'pickup' ? 'Store Pickup' : 'Home Delivery';
    
    if (!retailer) {
      retailer = await this.getRetailer(storeSlug);
    }
    const paymentText = this.getPaymentLabel(state.paymentMethod || 'cod', retailer);

    const text = `<b>Order Summary</b>\n\n${summary}\n\n<b>Total: ${price(total)}</b>\n\n` +
      `👤 Name: ${esc(state.name)}\n📧 Email: ${esc(state.email)}\n🏠 Address: ${esc(state.address)}\n` +
      `${deliveryIcon} Delivery: ${deliveryText}\n` +
      `💳 Payment: ${paymentText}\n\n` +
      `Confirm your order?`;

    if (isEdit) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: confirmKb });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: confirmKb });
    }
  }

  // ─── Confirm / Cancel order callbacks ───────────────────────────────────────
  // (Registered separately to keep the main callback handler clean)
  private async confirmOrder(ctx: any, userId: string, slug: string): Promise<void> {
    const state = this.checkoutSessions.get(userId);
    if (!state || state.storeSlug !== slug) {
      await ctx.editMessageText('Session expired. Please start again with /start.');
      return;
    }

    // ── Rate limiting: one order per 30 seconds per user (atomic) ──────────
    const thirtySecsAgo = new Date(Date.now() - 30_000);
    const updated = await this.prisma.telegramUser.updateMany({
      where: {
        id: userId,
        OR: [
          { lastOrderAt: null },
          { lastOrderAt: { lt: thirtySecsAgo } }
        ]
      },
      data: { lastOrderAt: new Date() }
    });

    if (updated.count === 0) {
      const user = await this.prisma.telegramUser.findUnique({ where: { id: userId } });
      if (user) {
        const lastAt = user.lastOrderAt?.getTime() || 0;
        const waitSec = Math.ceil((30_000 - (Date.now() - lastAt)) / 1000);
        await ctx.answerCallbackQuery(`⏳ Please wait ${waitSec}s before placing another order.`);
        return;
      } else {
        // First order for this user — handle race condition (Issue #1)
        try {
          await this.prisma.telegramUser.create({
            data: { id: userId, lastOrderAt: new Date() }
          });
        } catch (e: any) {
          // If another request created it simultaneously, treat it as a rate limit hit
          if (e.code === 'P2002') {
             await ctx.answerCallbackQuery(`⏳ Please wait a moment before placing another order.`);
             return;
          }
          throw e;
        }
      }
    }

    const items = await this.cartService.get(userId, slug);
    if (items.length === 0) {
      await ctx.answerCallbackQuery('⚠️ Your cart is empty.');
      return;
    }
    const total = await this.cartService.total(userId, slug);

    try {
      const retailer = await this.getRetailer(slug);
      // M7: Escape buyer data before passing to MCP to prevent XSS in seller admin
      const buyerName = esc(state.name);
      const buyerEmail = esc(state.email);
      const deliveryAddress = esc(state.address);
      const orderItems = items.map(i => ({ product_id: i.productId, quantity: i.quantity }));

      // BUG-2 FIX: Generate idempotency key based on items + user + timestamp (rounded to minute for safety)
      // or just a unique hash of the intended order content.
      const idempotencySource = JSON.stringify({ userId, slug, items: orderItems, total });
      const idempotencyKey = crypto.createHash('sha256').update(idempotencySource).digest('hex');

      try {
        await ctx.editMessageText('⏳ Processing your order... Please wait.', { parse_mode: 'HTML' });
      } catch (e: any) {
        if (!e.message?.includes('message is not modified')) {
          this.logger.warn(`Could not set processing message: ${e}`);
        }
      }

      // ── Step 1: Create the order in the seller's store ──────────────────────
      const result = await callRetailerTool(retailer, 'create_order', {
        items: orderItems,
        buyer_ref: userId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        delivery_address: deliveryAddress,
        channel: 'telegram',
        notes: '', 
        lat: state.lat,
        lng: state.lng,
        confirm: true,
        delivery_type: state.deliveryType || 'delivery',
        payment_provider: state.paymentMethod || retailer.paymentProvider || (await this.settings.get('default_payment_provider')) || 'cod',
        payment_instructions: retailer.paymentInstructions || (await this.settings.get('default_payment_instructions')) || '',
        idempotency_key: idempotencyKey, // Pass to seller
      }) as any;

      const content = result?.content || [];
      let orderId = 0;

      // 1. Try to parse from JSON content (reliable)
      for (const item of content) {
        if (item.type === 'text' && item.text?.startsWith('{')) {
          try {
            const parsed = JSON.parse(item.text);
            if (parsed.order_id) {
              orderId = parsed.order_id;
              break;
            }
          } catch (e) { /* not JSON */ }
        }
      }

      // 2. Fallback to regex (fragile)
      if (!orderId) {
        const resultText: string = result?.content?.[0]?.text ?? '';
        const match = resultText.match(/Order #(\d+)/);
        if (match) orderId = parseInt(match[1]);
      }

      if (!orderId) {
        throw new Error(`Failed to parse order ID from seller response: ${JSON.stringify(result)}`);
      }

      // BUG-2 FIX: Wrap local gateway operations in a transaction
      // This ensures cart clearing and Payment record creation are atomic.
      await this.prisma.$transaction(async (tx) => {
        await this.cartService.clear(userId, slug);
        
        // Update last order timestamp and save profile details
        const nameParts = state.name?.split(' ') || [];
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';
        
        await tx.telegramUser.update({
          where: { id: userId },
          data: { 
            lastOrderAt: new Date(),
            savedFirstName: fName,
            savedLastName: lName,
            savedEmail: state.email,
          },
        });

        // Step 2: Initiate payment if PaymentService is wired in
        if (this.paymentService && orderId) {
          const baseUrl = process.env.GATEWAY_PUBLIC_URL?.replace(/\/$/, '')
            ?? `http://localhost:${process.env.PORT ?? process.env.GATEWAY_PORT ?? 3002}`;

          const payment = await this.paymentService.initiatePayment({
            orderId,
            storeSlug:   slug,
            buyerRef:    userId,
            amount:      total,
            description: `Order #${orderId} — ${slug}`,
            buyerEmail:  state.email,
            baseUrl,
            providerOverride: state.paymentMethod || undefined,
          });

          // Send confirmation message to user
          if (payment.status === 'paid') {
            await ctx.editMessageText(
              orderConfirmation(orderId, items, total),
              { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
            );
          } else if (payment.provider === 'cod') {
            await ctx.editMessageText(
              `✅ <b>Order #${orderId} placed!</b>\n\n` +
              `Payment Method: <b>Cash on Delivery</b>\n\n` +
              `Please prepare <b>${price(total)}</b> in cash upon delivery/pickup.`,
              { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
            );
          } else if (payment.provider === 'assisted') {
            const label = retailer.assistedLabel || (await this.settings.get('default_payment_label')) || 'Assisted Payment';
            const payKb = new InlineKeyboard();
            if (payment.paymentUrl) {
              payKb.url(`💳 ${label}`, payment.paymentUrl).row();
            }
            payKb.text('🏠 Back to store', `bk:${slug}`);
            const instructions = retailer.paymentInstructions || (await this.settings.get('default_payment_instructions')) || '';

            await ctx.editMessageText(
              `✅ <b>Order #${orderId} placed!</b>\n\n` +
              (instructions ? `<b>Payment Instructions:</b>\n${esc(instructions)}\n\n` : '') +
              `<b>Total: ${price(total)}</b>\n\n` +
              `<i>Once you've made the payment, the store will verify and update your order status.</i>`,
              { parse_mode: 'HTML', reply_markup: payKb },
            );
          } else if (payment.paymentUrl) {
            const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(payment.paymentUrl);
            if (isLocalUrl) {
              await this.safeEditText(
                ctx,
                `✅ <b>Order #${orderId} placed!</b>\n\n` +
                `🧪 <b>Mock payment (local dev):</b>\n` +
                `Open this link in your browser to complete the test payment:\n` +
                `<code>${payment.paymentUrl}</code>`,
                { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
              );
            } else {
              const payKb = new InlineKeyboard()
                .url('💳 Pay Now', payment.paymentUrl)
                .row()
                .text('🏠 Back to store', `bk:${slug}`);

              await this.safeEditText(
                ctx,
                `✅ <b>Order #${orderId} placed!</b>\n\n` +
                `Please complete your payment of <b>${price(total)}</b> using the button below.\n\n` +
                `<i>You'll receive a confirmation message once payment is verified.</i>`,
                { parse_mode: 'HTML', reply_markup: payKb },
              );
            }
          } else {
            await ctx.editMessageText(
              orderConfirmation(orderId, items, total),
              { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
            );
          }
        } else {
          // No payment service — just confirm
          await ctx.editMessageText(
            orderConfirmation(orderId, items, total),
            { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
          );
        }
      });

      this.checkoutSessions.delete(userId);

      // ── Notify seller of new order ────────────────────────────────────────
      if (retailer.telegramNotifyChatId && this.bot) {
        try {
          const itemLines = items.map(i => `• ${i.title} × ${i.quantity} = ${price(i.price * i.quantity)}`).join('\n');
          const notifyMsg =
            `🔔 <b>New Order #${orderId}</b>\n\n` +
            `<b>Store:</b> ${esc(retailer.name)}\n` +
            `<b>Customer:</b> ${esc(state.name || 'Telegram Buyer')} (${userId})\n\n` +
            `<b>Items:</b>\n${itemLines}\n\n` +
            `<b>Total: ${price(total)}</b>\n\n` +
            `<b>Address:</b>\n${esc(state.address)}\n\n` +
            `<b>Payment:</b> ${esc(state.paymentMethod?.toUpperCase() || 'N/A')}\n\n` +
            `<i>Check Admin Panel for details.</i>`;

          await this.bot.api.sendMessage(retailer.telegramNotifyChatId, notifyMsg, { parse_mode: 'HTML' });
        } catch (e) {
          this.logger.warn(`Could not send Telegram notification to seller (${retailer.telegramNotifyChatId}): ${e}`);
        }
      }

    } catch (err: any) {
      this.logger.error(`Order creation failed: ${err}`);
      this.checkoutSessions.delete(userId);
      try {
        await ctx.editMessageText(
          '❌ Sorry, there was an error placing your order. Please try again.',
          { reply_markup: backKeyboard(slug) },
        );
      } catch (e: any) {
        if (!e.message?.includes('message is not modified')) {
          this.logger.error(`Failed to show order error: ${e}`);
        }
      }
    }
  }

  // ─── Notify user of order status change (called by OrdersService sync) ───────
  async notifyOrderStatusChange(params: {
    chatId: string;
    orderId: number;
    storeName: string;
    newStatus: string;
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
    cancellationReason?: string;
    paymentInstructions?: string;
  }) {
    if (!this.bot) return;
    const { chatId, orderId, storeName, newStatus } = params;

    const templates: Record<string, string> = {
      pending_payment: `✅ Order confirmed — payment instructions:\n\n${esc(params.paymentInstructions) || 'Please coordinate payment with the store.'}`,
      pending:         `✅ Order confirmed — payment received.`,
      paid:            `💳 Payment confirmed — your order is being prepared.`,
      picking:         `🗂 Your order is being picked.`,
      packing:         `📦 Your order is being packed.`,
      in_transit:      `🚚 Your order is on its way!\n\n<b>Courier:</b> ${esc(params.courierName) || 'N/A'}\n<b>Tracking:</b> ${esc(params.trackingNumber) || 'N/A'}${params.trackingUrl ? `\n<a href="${esc(params.trackingUrl)}">Track here</a>` : ''}`,
      ready_for_pickup: `🏪 Your order is ready for pickup at <b>${esc(storeName)}</b>!`,
      delivered:       `✅ Your order has been delivered!`,
      picked_up:       `✅ Your order has been picked up!`,
      cancelled:       `❌ Your order has been cancelled.${params.cancellationReason ? `\n\n<b>Reason:</b> ${esc(params.cancellationReason)}` : ''}`,
      refunded:        `💸 Your order has been refunded.`,
    };

    const text = templates[newStatus] || `Order #${orderId} status changed to <b>${esc(newStatus.replace(/_/g, ' '))}</b>.`;
    const message = `<b>${esc(storeName)}</b>\nOrder #${orderId}\n\n${text}`;

    try {
      await this.bot.api.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (err) {
      this.logger.error(`notifyOrderStatusChange failed for user ${chatId}: ${err}`);
    }
  }


  // ─── Notify user of payment status (called by WebhookController) ────────────
  async notifyPaymentStatus(params: {
    buyerRef:    string;
    storeSlug:   string;
    orderId:     number;
    status:      'paid' | 'failed';
    referenceId: string;
  }): Promise<void> {
    if (!this.bot) return;

    const chatId = params.buyerRef;
    if (!chatId) return;

    try {
      if (params.status === 'paid') {
        await this.bot.api.sendMessage(
          chatId,
          `✅ <b>Payment confirmed!</b>\n\nOrder #${params.orderId} has been paid successfully.\n` +
          `Reference: <code>${esc(params.referenceId)}</code>`,
          { parse_mode: 'HTML' },
        );
      } else {
        const retryKb = new InlineKeyboard().text('🔄 Try again', `s:${params.storeSlug}`);
        await this.bot.api.sendMessage(
          chatId,
          `❌ <b>Payment failed</b>\n\nWe couldn't process payment for Order #${params.orderId}.\n` +
          `Please try again or contact the store for assistance.`,
          { parse_mode: 'HTML', reply_markup: retryKb },
        );
      }
    } catch (err) {
      this.logger.error(`notifyPaymentStatus failed for user ${chatId}: ${err}`);
    }
  }

  // ─── AI message handler ─────────────────────────────────────────────────────
  private async handleAiMessage(
    ctx: any,
    userId: string,
    text: string,
    storeSlug: string,
  ): Promise<void> {
    const store = await this.registry.findBySlug(storeSlug);

    // Resolve AI config from DB (per-store fields on Retailer)
    const aiConfig = this.resolveAiConfig(store);
    if (!aiConfig) {
      await ctx.reply(
        '🤖 AI chat is not configured for this store yet.\n' +
        'The store admin needs to set an AI provider and API key.',
        { reply_markup: aiModeKeyboard(storeSlug) },
      );
      return;
    }

    // ── Unified Logging: Log buyer message ──
    const firstName = ctx.from?.first_name || '';
    const lastName = ctx.from?.last_name || '';
    const buyerName = `${firstName} ${lastName}`.trim() || ctx.from?.username || 'Buyer';
    
    const conv = await this.conversationService.getOrCreate(String(userId), buyerName, storeSlug);
    await this.conversationService.logMessage(conv.id, storeSlug, 'buyer', text, undefined, false, conv);

    await ctx.replyWithChatAction('typing');

    try {
      const retailer = await this.getRetailer(storeSlug);
      const result: ChatResult = await this.aiChat.chat(userId, storeSlug, store.name, retailer, text, aiConfig, conv);

      const cartCount = (await this.cartService.get(userId, storeSlug)).length;
      const shell = buildAiChatFooter(storeSlug, store.name, 'telegram', cartCount);

      const keyboard = result.products?.length
        ? aiProductKeyboard(storeSlug, result.products as any, cartCount)
        : shell.telegramKeyboard;

      await ctx.reply(result.text, { parse_mode: 'HTML', reply_markup: keyboard });

      // AI reply logging is handled inside AiChatService.chat()
    } catch (err) {
      this.logger.error(`AI chat error: ${err}`);
      await ctx.reply(
        'Sorry, I\'m having trouble right now. Please try again in a moment.',
        { reply_markup: aiModeKeyboard(storeSlug) },
      );
    }
  }

  // ─── Resolve per-store AI config ────────────────────────────────────────────
  private resolveAiConfig(store: any): StoreAiConfig | null {
    const provider = (store.aiProvider ?? 'claude') as 'claude' | 'gemini' | 'openai';
    const apiKey   = store.aiApiKey ?? null;
    if (!apiKey) return null;
    return {
      provider,
      apiKey,
      model:         store.aiModel        ?? null,
      systemPrompt:  store.aiSystemPrompt ?? null,
      serperApiKey:  store.serperApiKey   ?? null,
    };
  }

  // ─── Helper: resolve retailer target ───────────────────────────────────────
  private async getRetailer(slug: string) {
    const r = await this.registry.findBySlug(slug);
    if (!r.platformKey?.key) throw new Error(`No active key for store "${slug}"`);
    return {
      slug: r.slug,
      name: r.name,
      mcpServerUrl: r.mcpServerUrl,
      platformKey: r.platformKey.key,
      allowsPickup: r.allowsPickup,
      allowCod: r.allowCod,
      paymentProvider: r.paymentProvider,
      paymentMethods: r.paymentMethods,
      paymentInstructions: r.paymentInstructions,
      assistedLabel: r.assistedLabel,
      telegramNotifyChatId: r.telegramNotifyChatId,
    };
  }

  /**
   * Edit a message text in-place. If that fails (e.g. the current message is a
   * photo/media message that can't be converted to text), send a fresh text reply.
   */
  private async safeEditText(ctx: any, text: string, opts: any = {}): Promise<void> {
    try {
      await ctx.editMessageText(text, opts);
    } catch {
      await ctx.reply(text, opts);
    }
  }

  private async showPaymentSelection(ctx: any, slug: string, retailer: any): Promise<void> {
    const userId = ctx.from?.id?.toString() ?? '';
    const state = this.checkoutSessions.get(userId);
    if (!state) return;

    // ── Parse payment methods ─────────────────────────────────────────────
    let methods: string[] = [];
    try {
      methods = JSON.parse(retailer.paymentMethods || '[]');
    } catch (e) {
      this.logger.error(`Failed to parse paymentMethods for ${slug}: ${e}`);
    }

    // Fallback to legacy logic if paymentMethods is empty
    if (methods.length === 0) {
      const allowCod         = retailer.allowCod ?? true;
      const provider         = (retailer.paymentProvider || 'cod').toLowerCase();
      const hasOnlinePayment = provider !== 'cod';

      if (hasOnlinePayment && allowCod) {
        const onlineLabel = provider === 'assisted'
          ? `💳 ${retailer.assistedLabel || 'Bank / GCash'}`
          : '💳 Pay Online';

        const onlineId = provider === 'assisted' ? 'assisted' : provider;

        const kb = new InlineKeyboard()
          .text('💵 Cash on Delivery', `pmnt:cod:${slug}`).row()
          .text(onlineLabel,           `pmnt:${onlineId}:${slug}`).row()
          .text('❌ Cancel',           `cancel:${slug}`);

        await ctx.reply('💳 <b>How would you like to pay?</b>', {
          parse_mode: 'HTML',
          reply_markup: kb,
        });
        return;
      }

      // Only one method available — auto-select and skip the screen.
      state.paymentMethod = hasOnlinePayment ? provider : 'cod';
      state.step = 'confirm';
      this.checkoutSessions.set(userId, state);
      await this.showOrderSummary(ctx, userId, state.storeSlug, state, false, retailer);
      return;
    }

    // ── New multi-method logic ────────────────────────────────────────────
    if (methods.length > 1) {
      const kb = new InlineKeyboard();
      for (const m of methods) {
        const label = this.getPaymentLabel(m, retailer);
        kb.text(label, `pmnt:${m}:${slug}`).row();
      }
      kb.text('❌ Cancel', `cancel:${slug}`);

      await ctx.reply('💳 <b>How would you like to pay?</b>', {
        parse_mode: 'HTML',
        reply_markup: kb,
      });
      return;
    }

    // Only one method available — auto-select and skip the screen.
    state.paymentMethod = methods[0];
    state.step = 'confirm';
    this.checkoutSessions.set(userId, state);
    await this.showOrderSummary(ctx, userId, state.storeSlug, state, false, retailer);
  }

  private getPaymentLabel(id: string, retailer: any): string {
    switch (id.toLowerCase()) {
      case 'cod':       return '💵 Cash on Delivery';
      case 'mock':      return '🧪 Mock Payment (Test)';
      case 'assisted':  return `💳 ${retailer.assistedLabel || 'Bank / GCash'}`;
      case 'paymongo':  return '💳 PayMongo';
      case 'stripe':    return '💳 Stripe';
      default:          return `💳 ${id.toUpperCase()}`;
    }
  }

  private async resolveImageUrl(product: any, storeSlug: string): Promise<string | undefined> {
    const images = Array.isArray(product.images) ? product.images : [];
    let imageUrl = images[0] as string | undefined;

    if (!imageUrl) return undefined;

    // If it's already an absolute URL, return it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Otherwise, build an absolute URL using the store's MCP server base URL
    try {
      const retailer = await this.registry.findBySlug(storeSlug);
      if (!retailer || !retailer.mcpServerUrl) return undefined;

      const base = retailer.mcpServerUrl.replace(/\/sse\/?$/, '').replace(/\/$/, '');
      return `${base}/uploads/${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
    } catch {
      return undefined;
    }
  }
}
