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
import { CartService } from './cart.service';
import { ConversationService } from '../chat/conversation.service';
import { PaymentService } from '../payments/payment.service';
import { CB, storeListKeyboard, storeMenuKeyboard, categoryKeyboard,
         productListKeyboard, productDetailKeyboard, productDetailSearchKeyboard,
         cartKeyboard, emptyCartKeyboard, aiModeKeyboard, aiProductKeyboard,
         backKeyboard, quantityKeyboard } from './keyboards';
import { esc, price, productDetail, cartSummary, orderConfirmation,
         welcomeMessage, storeMenuMessage, aiGreeting } from './formatters';

const PAGE_SIZE = 8;

// ─── Checkout session state ───────────────────────────────────────────────────
interface CheckoutState {
  storeSlug:     string;
  step:          'name' | 'email' | 'address' | 'delivery' | 'payment' | 'confirm';
  name?:         string;
  email?:        string;
  address?:      string;
  deliveryType?: 'delivery' | 'pickup';
  paymentMethod?: 'cod' | 'gateway';  // 'gateway' = store's configured provider
}

// ─── AI session state ─────────────────────────────────────────────────────────
interface AiState {
  storeSlug: string;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot | null = null;
  private webhookMode = false;
  private webhookSecret = '';

  // Per-user session maps (in-memory)
  private checkoutSessions = new Map<string, CheckoutState>();
  private aiSessions       = new Map<string, AiState>();
  private searchQueries    = new Map<string, string>();  // userId → last search query
  private lastStoreSlug    = new Map<string, string>();  // userId → most recently visited store slug

  constructor(
    private readonly registry: RegistryService,
    private readonly settings: SettingsService,
    private readonly catalog: CatalogService,
    private readonly aiChat: AiChatService,
    private readonly cartService: CartService,
    private readonly conversationService: ConversationService,
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
      const slug =
        this.aiSessions.get(userId)?.storeSlug ??
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
          this.aiSessions.delete(userId);
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
          this.aiSessions.delete(userId);
          const retailer = await this.registry.findBySlug(slug);
          await ctx.editMessageText(storeMenuMessage(retailer.name), {
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
          const [, type, slug] = data.split(':');
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
          const [, method, slug] = data.split(':');
          const state = this.checkoutSessions.get(userId);
          if (!state || state.storeSlug !== slug) return;

          state.paymentMethod = method as 'cod' | 'gateway';
          state.step = 'confirm';
          this.checkoutSessions.set(userId, state);
          await this.showOrderSummary(ctx, userId, slug, state, true);
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
          this.aiSessions.set(userId, { storeSlug: slug });
          const retailer = await this.registry.findBySlug(slug);
          await ctx.editMessageText(aiGreeting(retailer.name), {
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
        const slug =
          this.aiSessions.get(userId)?.storeSlug ??
          this.checkoutSessions.get(userId)?.storeSlug ??
          this.lastStoreSlug.get(userId);

        if (slug) {
          const conv = await this.conversationService.getOrCreate(String(userId), ctx.from.first_name || 'Buyer', slug);
          if (conv.mode === 'ai') {
            await this.conversationService.setMode(conv.id, 'human');
            await this.conversationService.logMessage(conv.id, slug, 'system', 'Buyer requested a human agent via keyword');
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
      const aiState = this.aiSessions.get(userId);
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

  // ─── Cross-store product search ─────────────────────────────────────────────
  private async sendSearchResults(
    ctx: any,
    rawQuery: string,
    offset: number,
    edit = false,
  ): Promise<void> {
    const PAGE = 8;
    const userId = ctx.from?.id.toString();

    const { results, total, parsed, fallback } = await this.catalog.smartSearch(rawQuery, { limit: PAGE, offset });
    const { keywords, maxPrice, minPrice, inStockOnly } = parsed;

    // ── Build header ────────────────────────────────────────────────────────
    const ph = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
    const filters: string[] = [];
    if (keywords)                 filters.push(`<b>${esc(keywords)}</b>`);
    if (minPrice != null && maxPrice != null)
                                  filters.push(`${ph(minPrice)}–${ph(maxPrice)}`);
    else if (minPrice != null)    filters.push(`from ${ph(minPrice)}`);
    else if (maxPrice != null)    filters.push(`under ${ph(maxPrice)}`);
    if (inStockOnly)              filters.push('in stock');

    const label = filters.length ? filters.join(' · ') : 'all products';

    if (!results.length && offset === 0) {
      const msg = `🔍 No products found for ${label}.\n\nTry a different keyword or browse by /stores.`;
      if (edit) await ctx.editMessageText(msg, { parse_mode: 'HTML' });
      else       await ctx.reply(msg, { parse_mode: 'HTML' });
      return;
    }

    const hasAnyImages = results.some((p: any) => p.images?.length > 0);
    const fallbackNote = fallback ? `\n<i>💡 No exact matches — showing similar results</i>` : '';

    const lines: string[] = [
      `🔍 ${label} — ${total} result${total !== 1 ? 's' : ''} across all stores${fallbackNote}\n`,
    ];

    if (hasAnyImages) lines.push('\n<i>📷 = has photo — tap product to view</i>');

    // Pagination + product buttons keyboard
    const keyboard = new InlineKeyboard();
    const hasPrev = offset > 0;
    const hasNext = offset + PAGE < total;
    if (hasPrev) keyboard.text('← Prev', `srch:${offset - PAGE}`);
    if (hasNext) keyboard.text('Next →', `srch:${offset + PAGE}`);
    if (hasPrev || hasNext) keyboard.row();
    for (const p of results) {
      const priceStr = p.price != null ? `₱${p.price.toLocaleString('en-PH', { minimumFractionDigits: 0 })}` : 'TBD';
      keyboard.text(`${p.title.slice(0, 35)} (${priceStr})`, `p:${p.storeSlug}:${p.sellerId}`).row();
    }
    // Show View Cart shortcut if user has a known active store
    const cartSlug = userId
      ? (this.aiSessions.get(userId)?.storeSlug ?? this.lastStoreSlug.get(userId))
      : undefined;
    if (cartSlug) keyboard.text('🛍 View Cart', CB.cart(cartSlug));

    const text = lines.join('\n');
    if (edit) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
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
      await ctx.editMessageText(
        `No categories found.\n\n💡 <i>Tip: sync your catalog from the seller admin panel.</i>`,
        { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
      );
      return;
    }

    await ctx.editMessageText(
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
      await ctx.editMessageText('No products found.', { reply_markup: backKeyboard(slug) });
      return;
    }

    const syncNote = synced ? '' : '\n\n<i>💡 Sync catalog for faster browsing.</i>';
    await ctx.editMessageText(
      `<b>Products</b> (page ${page + 1})${syncNote}\n\n<i>Tap a product for details:</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: productListKeyboard(slug, pageProducts, catId, page, hasMore),
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

    // ── 3. Build message text ─────────────────────────────────────────────────
    // Use Telegram's invisible-link-preview trick:
    // An anchor tag with a zero-width-space (&#8203;) as text causes Telegram to
    // display the image as a preview thumbnail while keeping the message as text.
    // This avoids the replyWithPhoto approach which breaks editMessageText flows.
    let msg = productDetail(product);
    const imageUrl = Array.isArray(product.images)
      ? product.images[0]
      : (product.image_url as string | undefined);
    if (imageUrl?.startsWith('http')) {
      msg = `<a href="${imageUrl}">&#8203;</a>${msg}`;
    }

    // ── 4. Choose keyboard based on context ───────────────────────────────────
    // If the user has an active search query, offer "Back to Search" instead of
    // the generic category-list back button.
    const keyboard = (userId && this.searchQueries.has(userId))
      ? productDetailSearchKeyboard(slug, productId)
      : productDetailKeyboard(slug, productId, 'all', 0);

    // ── 5. Edit the existing message (stays as text → all nav works) ──────────
    try {
      await ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: keyboard });
    } catch {
      // Fallback: send new message (e.g. triggered from a non-inline context)
      await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: keyboard });
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
    this.checkoutSessions.set(userId, { storeSlug: slug, step: 'name' });
    await ctx.reply('🛍 <b>Checkout</b>\n\nWhat\'s your name?', { parse_mode: 'HTML' });
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
      state.step = 'address';
      this.checkoutSessions.set(userId, state);
      await ctx.reply('🏠 What\'s your delivery address?');
      return;
    }

    if (state.step === 'address') {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 300) {
        await ctx.reply('⚠️ Please enter a valid address (1–300 characters).');
        return;
      }
      state.address = trimmed;
      
      const retailer = await this.getRetailer(storeSlug);
      if (retailer.allowsPickup) {
        state.step = 'delivery';
        this.checkoutSessions.set(userId, state);
        
        const deliveryKb = new InlineKeyboard()
          .text('🏠 Home Delivery', `delivery:delivery:${storeSlug}`)
          .text('🏪 Store Pickup',  `delivery:pickup:${storeSlug}`);
          
        await ctx.reply('🚚 How would you like to receive your order?', { reply_markup: deliveryKb });
        return;
      }

      state.step = 'payment';
      state.deliveryType = 'delivery';
      this.checkoutSessions.set(userId, state);
      await this.showPaymentSelection(ctx, storeSlug, retailer);
      return;
    }
  }

  private async showOrderSummary(ctx: any, userId: string, storeSlug: string, state: CheckoutState, isEdit = false): Promise<void> {
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
    const paymentText = state.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment';

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
      const notes = `Name: ${esc(state.name)}, Email: ${esc(state.email)}, Address: ${esc(state.address)}`;
      const orderItems = items.map(i => ({ product_id: i.productId, quantity: i.quantity }));

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
        channel: 'telegram',
        notes,
        confirm: true,
        delivery_type: state.deliveryType || 'delivery',
        payment_provider: retailer.paymentProvider || (await this.settings.get('default_payment_provider')) || 'cod',
        payment_instructions: retailer.paymentInstructions || (await this.settings.get('default_payment_instructions')) || '',
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

      await this.cartService.clear(userId, slug);
      this.checkoutSessions.delete(userId);
      
      // Update last order timestamp in DB
      await this.prisma.telegramUser.update({
        where: { id: userId },
        data: { lastOrderAt: new Date() },
      });

      // ── Notify seller of new order ────────────────────────────────────────
      if (this.bot && orderId) {
        try {
          const fullRetailer = await this.registry.findBySlug(slug);
          if (fullRetailer.telegramNotifyChatId) {
            const itemSummary = items.map(i => `• ${esc(i.title)} × ${i.quantity} — ${price(i.price * i.quantity)}`).join('\n');
            this.bot.api.sendMessage(
              fullRetailer.telegramNotifyChatId,
              `🛒 <b>New Order #${orderId}</b> — ${esc(fullRetailer.name)}\n\n` +
              `${itemSummary}\n\n` +
              `<b>Total:</b> ${price(total)}\n` +
              `<b>Buyer:</b> ${esc(state.name ?? '')}\n` +
              `<b>Email:</b> ${esc(state.email ?? '')}\n` +
              `<b>Address:</b> ${esc(state.address ?? '')}`,
              { parse_mode: 'HTML' },
            ).catch(async (e: any) => {
              this.logger.error(`Seller notify failed for ${slug}: ${e}`);
              // Log to AuditLog for admin visibility
              await this.prisma.auditLog.create({
                data: {
                  retailerId: fullRetailer.id,
                  event: 'seller_notification_failed',
                  meta: { orderId, error: String(e), chatId: fullRetailer.telegramNotifyChatId }
                }
              }).catch(() => {});
            });
          }
        } catch (e) {
          this.logger.warn(`Could not load retailer for seller notify (${slug}): ${e}`);
        }
      }

      // ── Step 2: Initiate payment if PaymentService is wired in ──────────────
      if (this.paymentService && orderId) {
        const baseUrl = process.env.GATEWAY_PUBLIC_URL?.replace(/\/$/, '')
          ?? `http://localhost:${process.env.PORT ?? process.env.GATEWAY_PORT ?? 3002}`;

        try {
          const payment = await this.paymentService.initiatePayment({
            orderId,
            storeSlug:   slug,
            buyerRef:    userId,
            amount:      total,
            currency:    'PHP',
            description: `Order #${orderId} — ${slug}`,
            buyerEmail:  state.email,
            baseUrl,
            providerOverride: state.paymentMethod === 'cod' ? 'cod' : undefined,
          });

          if (payment.status === 'paid') {
            // Mock gateway — confirmed instantly, no redirect needed
            await ctx.editMessageText(
              orderConfirmation(orderId, items, total),
              { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
            );
          } else if (payment.provider === 'cod') {
            // Cash on Delivery
            await ctx.editMessageText(
              `✅ <b>Order #${orderId} placed!</b>\n\n` +
              `Payment Method: <b>Cash on Delivery</b>\n\n` +
              `Please prepare <b>${price(total)}</b> in cash upon delivery/pickup.`,
              { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
            );
          } else if (payment.provider === 'assisted') {
            // Assisted Payment (Offline / Manual)
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
            // Real gateway — send payment link
            const payKb = new InlineKeyboard()
              .url('💳 Pay Now', payment.paymentUrl)
              .row()
              .text('🏠 Back to store', `bk:${slug}`);

            await ctx.editMessageText(
              `✅ <b>Order #${orderId} placed!</b>\n\n` +
              `Please complete your payment of <b>${price(total)}</b> using the button below.\n\n` +
              `<i>You'll receive a confirmation message once payment is verified.</i>`,
              { parse_mode: 'HTML', reply_markup: payKb },
            );
          } else {
            // Fallback: payment initiated but no URL
            await ctx.editMessageText(
              orderConfirmation(orderId, items, total),
              { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
            );
          }
          return;
        } catch (payErr) {
          this.logger.error(`Payment initiation failed for order ${orderId}: ${payErr}`);
          await ctx.editMessageText(
            orderConfirmation(orderId, items, total) + 
            '\n\n⚠️ <b>Payment initiation failed.</b> Your order has been placed, but we couldn\'t process the payment online. Please contact the store to arrange payment.',
            { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
          );
          return;
        }
      }

      // Fallback if no payment service or payment failed to initiate
      await ctx.editMessageText(
        orderConfirmation(orderId, items, total),
        { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
      );
    } catch (err) {
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
      pending_payment: `✅ Order confirmed — payment instructions:\n\n${params.paymentInstructions || 'Please coordinate payment with the store.'}`,
      pending:         `✅ Order confirmed — payment received.`,
      paid:            `💳 Payment confirmed — your order is being prepared.`,
      picking:         `🗂 Your order is being picked.`,
      packing:         `📦 Your order is being packed.`,
      in_transit:      `🚚 Your order is on its way!\n\nCourier: ${params.courierName || 'N/A'}\nTracking: ${params.trackingNumber || 'N/A'}${params.trackingUrl ? `\n[Track here](${params.trackingUrl})` : ''}`,
      ready_for_pickup: `🏪 Your order is ready for pickup at ${storeName}!`,
      delivered:       `✅ Your order has been delivered!`,
      picked_up:       `✅ Your order has been picked up!`,
      cancelled:       `❌ Your order has been cancelled.${params.cancellationReason ? `\nReason: ${params.cancellationReason}` : ''}`,
      refunded:        `💸 Your order has been refunded.`,
    };

    const text = templates[newStatus] || `Order #${orderId} status changed to ${newStatus.replace(/_/g, ' ')}.`;
    const message = `*${esc(storeName)}*\nOrder #${orderId}\n\n${text}`;

    try {
      await this.bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
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
    await this.conversationService.logMessage(conv.id, storeSlug, 'buyer', text);

    await ctx.replyWithChatAction('typing');

    try {
      const retailer = await this.getRetailer(storeSlug);
      const result: ChatResult = await this.aiChat.chat(userId, storeSlug, store.name, retailer, text, aiConfig, conv.id);

      const keyboard = result.products?.length
        ? aiProductKeyboard(storeSlug, result.products)
        : aiModeKeyboard(storeSlug);

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
      mcpServerUrl: r.mcpServerUrl,
      platformKey: r.platformKey.key,
      allowsPickup: r.allowsPickup,
      allowCod: r.allowCod,
      paymentProvider: r.paymentProvider,
      paymentInstructions: r.paymentInstructions,
      assistedLabel: r.assistedLabel,
    };
  }

  private async showPaymentSelection(ctx: any, slug: string, retailer: any): Promise<void> {
    const allowCod = retailer.allowCod ?? true;
    const provider = (retailer.paymentProvider || 'cod').toLowerCase();
    const hasRealGateway = !['cod', 'mock', 'assisted'].includes(provider);

    // If only one method is possible, skip selection
    if (!hasRealGateway || !allowCod) {
      // Auto-select the only available method
      const state = this.checkoutSessions.get(ctx.from?.id?.toString() ?? '');
      if (state) {
        // If COD is disabled, we MUST use gateway (even if it's just mock/assisted)
        // If COD is enabled but there's no real online gateway, we prefer COD
        state.paymentMethod = !allowCod ? 'gateway' : 'cod';
        state.step = 'confirm';
        this.checkoutSessions.set(ctx.from?.id?.toString() ?? '', state);
        await this.showOrderSummary(ctx, ctx.from?.id?.toString() ?? '', state.storeSlug, state);
      }
      return;
    }

    const kb = new InlineKeyboard();
    const onlineLabel = provider === 'assisted' 
      ? `💳 ${retailer.assistedLabel || 'Bank / GCash'}`
      : '💳 Pay Online';

    if (allowCod) kb.text('💵 Cash on Delivery', `pmnt:cod:${slug}`).row();
    if (hasRealGateway) kb.text(onlineLabel, `pmnt:gateway:${slug}`).row();
    kb.text('❌ Cancel', `cancel:${slug}`);

    await ctx.reply('💳 <b>How would you like to pay?</b>', {
      parse_mode: 'HTML',
      reply_markup: kb,
    });
  }
}
