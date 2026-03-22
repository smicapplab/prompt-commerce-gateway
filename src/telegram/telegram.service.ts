import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Bot, InlineKeyboard } from 'grammy';
import { RegistryService } from '../registry/registry.service';
import { SettingsService } from '../settings/settings.service';
import { CatalogService } from '../catalog/catalog.service';
import { callRetailerTool } from '../mcp/retailer-client';
import { AiChatService, type StoreAiConfig } from './ai-chat.service';
import { CartStore } from './cart.store';
import { CB, storeListKeyboard, storeMenuKeyboard, categoryKeyboard,
         productListKeyboard, productDetailKeyboard, cartKeyboard,
         emptyCartKeyboard, aiModeKeyboard, backKeyboard } from './keyboards';
import { esc, price, productDetail, cartSummary, orderConfirmation,
         welcomeMessage, storeMenuMessage, aiGreeting } from './formatters';

const PAGE_SIZE = 8;

// ─── Checkout session state ───────────────────────────────────────────────────
interface CheckoutState {
  storeSlug: string;
  step: 'name' | 'email' | 'address' | 'confirm';
  name?: string;
  email?: string;
  address?: string;
}

// ─── AI session state ─────────────────────────────────────────────────────────
interface AiState {
  storeSlug: string;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot | null = null;

  // Per-user session maps (in-memory)
  private checkoutSessions = new Map<number, CheckoutState>();
  private aiSessions       = new Map<number, AiState>();
  private searchQueries    = new Map<number, string>();  // userId → last search query

  constructor(
    private readonly registry: RegistryService,
    private readonly settings: SettingsService,
    private readonly catalog: CatalogService,
    private readonly aiChat: AiChatService,
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  async onModuleInit(): Promise<void> {
    // Load bot token from DB first; fall back to env var for local dev convenience
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
    ]);
    this.bot.start({ onStart: () => this.logger.log('Telegram bot started.') });
  }

  onModuleDestroy(): Promise<void> | void {
    return this.bot?.stop();
  }

  // ─── Handler registration ───────────────────────────────────────────────────
  private registerHandlers(): void {
    if (!this.bot) return;
    const bot = this.bot;

    // ── /start ─────────────────────────────────────────────────────────────
    bot.command('start', async (ctx) => {
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
      const stores = await this.registry.findActiveRetailers();
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
      const userId = ctx.from?.id;
      if (!userId) return;

      // Find which store the user last interacted with via AI session or prompt them
      const aiState = this.aiSessions.get(userId);
      const checkoutState = this.checkoutSessions.get(userId);
      const slug = aiState?.storeSlug ?? checkoutState?.storeSlug;

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
        await ctx.reply('What are you looking for?\n\nSend me a product name, e.g. <b>/search sneakers</b>', { parse_mode: 'HTML' });
        return;
      }
      const userId = ctx.from?.id;
      if (userId) this.searchQueries.set(userId, query);
      await this.sendSearchResults(ctx, query, 0);
    });

    // ── /help ──────────────────────────────────────────────────────────────
    bot.command('help', async (ctx) => {
      await ctx.reply(
        '<b>Prompt Commerce Bot</b>\n\n' +
        '/search &lt;keyword&gt; — Search products across all stores\n' +
        '/stores — Browse by store\n' +
        '/cart — View your cart\n' +
        '/help — This message\n\n' +
        'Or just type any product name to search instantly.',
        { parse_mode: 'HTML' },
      );
    });

    // ── Callback queries ───────────────────────────────────────────────────
    bot.on('callback_query:data', async (ctx) => {
      await ctx.answerCallbackQuery();
      const data = ctx.callbackQuery.data;
      const userId = ctx.from.id;

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

        // c:<slug>:<catId> — products in category
        if (data.startsWith('c:')) {
          const [, slug, catId] = data.split(':');
          await this.sendProducts(ctx, slug, parseInt(catId), 0);
          return;
        }

        // pg:<slug>:<catId>:<page> — paginate products
        if (data.startsWith('pg:')) {
          const parts = data.split(':');
          const slug = parts[1];
          const catId = parts[2];
          const page  = parseInt(parts[3]);
          await this.sendProducts(ctx, slug, catId === 'all' ? 'all' : parseInt(catId), page);
          return;
        }

        // p:<slug>:<productId> — product detail
        if (data.startsWith('p:')) {
          const [, slug, productId] = data.split(':');
          await this.sendProductDetail(ctx, slug, parseInt(productId));
          return;
        }

        // a:<slug>:<productId> — add to cart
        if (data.startsWith('a:')) {
          const [, slug, productId] = data.split(':');
          await this.addToCart(ctx, userId, slug, parseInt(productId));
          return;
        }

        // r:<slug>:<productId> — remove from cart
        if (data.startsWith('r:')) {
          const [, slug, productId] = data.split(':');
          CartStore.remove(userId, slug, parseInt(productId));
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

        // cancel:<slug> — abort checkout
        if (data.startsWith('cancel:')) {
          const slug = data.slice(7);
          this.checkoutSessions.delete(userId);
          CartStore.clear(userId, slug);
          const retailer = await this.registry.findBySlug(slug);
          await ctx.editMessageText(
            `Order cancelled. Your cart has been cleared.\n\n${storeMenuMessage(retailer.name)}`,
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
      const userId = ctx.from?.id;
      if (!userId) return;
      const text = ctx.message.text;
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

  // ─── Cross-store product search ─────────────────────────────────────────────
  private async sendSearchResults(
    ctx: any,
    query: string,
    offset: number,
    edit = false,
  ): Promise<void> {
    const PAGE = 8;
    const [results, total] = await Promise.all([
      this.catalog.searchAllStores(query, { limit: PAGE, offset }),
      this.catalog.countSearchAllStores(query),
    ]);

    if (!results.length && offset === 0) {
      const msg = `🔍 No products found for <b>${esc(query)}</b>.\n\nTry a different keyword or browse by /stores.`;
      if (edit) await ctx.editMessageText(msg, { parse_mode: 'HTML' });
      else       await ctx.reply(msg, { parse_mode: 'HTML' });
      return;
    }

    // Build result lines grouped by store
    const lines: string[] = [
      `🔍 <b>${esc(query)}</b> — ${total} result${total !== 1 ? 's' : ''} across all stores\n`,
    ];
    for (const p of results) {
      const priceStr = p.price != null ? `₱${p.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'Price TBD';
      const stock    = p.stockQuantity > 0 ? '' : ' <i>(out of stock)</i>';
      lines.push(`• <b>${esc(p.title)}</b>${stock}\n  ${priceStr} — <i>${esc(p.storeSlug)}</i>`);
    }

    // Pagination keyboard
    const keyboard = new InlineKeyboard();
    const hasPrev = offset > 0;
    const hasNext = offset + PAGE < total;
    if (hasPrev) keyboard.text('← Prev', `srch:${offset - PAGE}`);
    if (hasNext) keyboard.text('Next →', `srch:${offset + PAGE}`);
    // "View in store" buttons for each result on this page
    keyboard.row();
    for (const p of results) {
      keyboard.text(`🛒 ${p.title.slice(0, 20)}`, `p:${p.storeSlug}:${p.sellerId}`).row();
    }

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

    const lines = pageProducts.map(p => {
      const stockTag = p.stock_quantity === 0 ? ' ⚠️' : '';
      return `• <b>${esc(p.title)}</b>${stockTag} — ${price(p.price)}`;
    }).join('\n');

    const syncNote = synced ? '' : '\n\n<i>💡 Sync catalog for faster browsing.</i>';
    await ctx.editMessageText(
      `<b>Products</b> (page ${page + 1})\n\n${lines}${syncNote}\n\n<i>Tap a product for details:</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: productListKeyboard(slug, pageProducts, catId, page, hasMore),
      },
    );
  }

  // ─── Send product detail ────────────────────────────────────────────────────
  private async sendProductDetail(ctx: any, slug: string, productId: number): Promise<void> {
    const retailer = await this.getRetailer(slug);
    const result = await callRetailerTool(retailer, 'get_product', { id: productId }) as any;
    const text = result?.content?.[0]?.text ?? '{}';
    let product: any = {};
    try { product = JSON.parse(text); } catch { /* empty */ }

    if (!product.id) {
      await ctx.editMessageText('Product not found.', { reply_markup: backKeyboard(slug) });
      return;
    }

    const msg = productDetail(product);

    // If product has images, try to send a photo
    const imageUrl = product.images?.[0];
    if (imageUrl?.startsWith('http')) {
      try {
        await ctx.replyWithPhoto(imageUrl, {
          caption: msg,
          parse_mode: 'HTML',
          reply_markup: productDetailKeyboard(slug, productId, 'all', 0),
        });
        return;
      } catch {
        // Fall through to text if photo fails
      }
    }

    await ctx.editMessageText(msg, {
      parse_mode: 'HTML',
      reply_markup: productDetailKeyboard(slug, productId, 'all', 0),
    });
  }

  // ─── Add to cart ────────────────────────────────────────────────────────────
  private async addToCart(ctx: any, userId: number, slug: string, productId: number): Promise<void> {
    const retailer = await this.getRetailer(slug);
    const result = await callRetailerTool(retailer, 'get_product', { id: productId }) as any;
    const text = result?.content?.[0]?.text ?? '{}';
    let product: any = {};
    try { product = JSON.parse(text); } catch { /* empty */ }

    if (!product.id) {
      await ctx.answerCallbackQuery('Product not found.');
      return;
    }
    if (product.stock_quantity === 0) {
      await ctx.answerCallbackQuery('⚠️ This product is out of stock.');
      return;
    }

    CartStore.add(userId, slug, {
      productId: product.id,
      title: product.title,
      price: product.price ?? 0,
    });

    const total = CartStore.total(userId, slug);
    await ctx.answerCallbackQuery(`✅ Added! Cart total: ${price(total)}`);
  }

  // ─── Send cart ──────────────────────────────────────────────────────────────
  private async sendCart(ctx: any, userId: number, slug: string): Promise<void> {
    const retailer = await this.registry.findBySlug(slug);
    const items = CartStore.get(userId, slug);
    const total = CartStore.total(userId, slug);
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
  private async startCheckout(ctx: any, userId: number, slug: string): Promise<void> {
    if (CartStore.isEmpty(userId, slug)) {
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
    userId: number,
    text: string,
    state: CheckoutState,
  ): Promise<void> {
    const { storeSlug } = state;

    if (state.step === 'name') {
      state.name = text;
      state.step = 'email';
      this.checkoutSessions.set(userId, state);
      await ctx.reply('📧 What\'s your email address?');
      return;
    }

    if (state.step === 'email') {
      state.email = text;
      state.step = 'address';
      this.checkoutSessions.set(userId, state);
      await ctx.reply('🏠 What\'s your delivery address?');
      return;
    }

    if (state.step === 'address') {
      state.address = text;
      state.step = 'confirm';
      this.checkoutSessions.set(userId, state);

      const items = CartStore.get(userId, storeSlug);
      const total = CartStore.total(userId, storeSlug);
      const summary = items.map(i => `• ${i.title} × ${i.quantity} — ${price(i.price * i.quantity)}`).join('\n');

      const confirmKb = new InlineKeyboard()
        .text('✅ Confirm Order', `confirm:${storeSlug}`)
        .text('❌ Cancel',        `cancel:${storeSlug}`);

      await ctx.reply(
        `<b>Order Summary</b>\n\n${summary}\n\n<b>Total: ${price(total)}</b>\n\n` +
        `👤 Name: ${esc(state.name)}\n📧 Email: ${esc(state.email)}\n🏠 Address: ${esc(state.address)}\n\n` +
        `Confirm your order?`,
        { parse_mode: 'HTML', reply_markup: confirmKb },
      );
      return;
    }
  }

  // ─── Confirm / Cancel order callbacks ───────────────────────────────────────
  // (Registered separately to keep the main callback handler clean)
  private async confirmOrder(ctx: any, userId: number, slug: string): Promise<void> {
    const state = this.checkoutSessions.get(userId);
    if (!state || state.storeSlug !== slug) {
      await ctx.editMessageText('Session expired. Please start again with /start.');
      return;
    }

    const items = CartStore.get(userId, slug);
    const total = CartStore.total(userId, slug);

    const retailer = await this.getRetailer(slug);
    const notes = `Name: ${state.name}, Email: ${state.email}, Address: ${state.address}`;
    const orderItems = items.map(i => ({ product_id: i.productId, quantity: i.quantity }));

    try {
      const result = await callRetailerTool(retailer, 'create_order', {
        items: orderItems,
        buyer_ref: String(userId),
        channel: 'telegram',
        notes,
        confirm: true,
      }) as any;

      const resultText: string = result?.content?.[0]?.text ?? '';
      const match = resultText.match(/Order #(\d+)/);
      const orderId = match ? parseInt(match[1]) : 0;

      CartStore.clear(userId, slug);
      this.checkoutSessions.delete(userId);

      await ctx.editMessageText(
        orderConfirmation(orderId, items, total),
        { parse_mode: 'HTML', reply_markup: backKeyboard(slug) },
      );
    } catch (err) {
      this.logger.error(`Order creation failed: ${err}`);
      await ctx.editMessageText(
        '❌ Sorry, there was an error placing your order. Please try again.',
        { reply_markup: backKeyboard(slug) },
      );
    }
  }

  // ─── AI message handler ─────────────────────────────────────────────────────
  private async handleAiMessage(
    ctx: any,
    userId: number,
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

    await ctx.replyWithChatAction('typing');

    try {
      const retailer = await this.getRetailer(storeSlug);
      const reply = await this.aiChat.chat(userId, storeSlug, store.name, retailer, text, aiConfig);

      await ctx.reply(reply, {
        parse_mode: 'HTML',
        reply_markup: aiModeKeyboard(storeSlug),
      });
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
    const provider = (store.aiProvider ?? 'gemini') as 'claude' | 'gemini';
    const apiKey   = store.aiApiKey ?? null;
    if (!apiKey) return null;
    return { provider, apiKey, model: store.aiModel };
  }

  // ─── Helper: resolve retailer target ───────────────────────────────────────
  private async getRetailer(slug: string) {
    const r = await this.registry.findBySlug(slug);
    if (!r.platformKey?.key) throw new Error(`No active key for store "${slug}"`);
    return {
      slug: r.slug,
      mcpServerUrl: r.mcpServerUrl,
      platformKey: r.platformKey.key,
    };
  }
}
