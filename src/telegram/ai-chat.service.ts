import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { CatalogService } from '../catalog/catalog.service';
import {
  GoogleGenerativeAI,
  type FunctionDeclaration,
  type Schema,
  SchemaType,
} from '@google/generative-ai';
import OpenAI from 'openai';
import { callRetailerTool, type RetailerTarget } from '../mcp/retailer-client';
import { ConversationService } from '../chat/conversation.service';
import { ChatService } from '../chat/chat.service';
import { SettingsService } from '../settings/settings.service';
import { isSsrfSafe, safeFetch } from '../utils/ssrf';

// ─── Store AI config (read from Retailer row) ────────────────────────────────
export interface StoreAiConfig {
  provider:      'claude' | 'gemini' | 'openai';
  apiKey:        string;
  model?:        string | null;
  systemPrompt?: string | null;  // custom persona set by the store owner
  serperApiKey?: string | null;  // for search_images tool
}

// ─── Structured chat result (text + optional product buttons) ────────────────
export interface ProductButton {
  id:    number;
  title: string;
  price: number | null;
}

export interface ChatResult {
  text:      string;
  products?: ProductButton[];
}

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOL_SPECS = [
  {
    name: 'search_products',
    description: 'Search for products by keyword, category, or price range.',
    properties: {
      query:     { type: 'string',  description: 'Search keyword' },
      category:  { type: 'string',  description: 'Filter by category name' },
      min_price: { type: 'number',  description: 'Minimum price' },
      max_price: { type: 'number',  description: 'Maximum price' },
      limit:     { type: 'integer', description: 'Max results (default 10)' },
    },
  },
  {
    name: 'get_product',
    description: 'Get full details for a single product by ID or SKU.',
    properties: {
      id:  { type: 'integer', description: 'Product ID' },
      sku: { type: 'string',  description: 'Product SKU' },
    },
  },
  {
    name: 'list_categories',
    description: 'List all product categories in the store.',
    properties: {},
  },
  {
    name: 'get_promotions',
    description: 'Get active promotions and voucher codes.',
    properties: {},
  },
  {
    name: 'fetch_url',
    description:
      'Fetch any public URL and return its content. ' +
      'Use this to visit product pages (e.g. Amazon, Shopee) to extract product info, ' +
      'descriptions, or direct image URLs. Returns page text and a list of image URLs found on the page. ' +
      'After getting an image URL, pass it to create_product or update_product — it will be downloaded automatically.',
    properties: {
      url: { type: 'string', description: 'The full URL to fetch (https://...)' },
    },
  },
  {
    name: 'search_images',
    description:
      'Search Google Images for a product and return direct image URLs. ' +
      'Use this when the seller asks you to find an image for a product automatically — ' +
      'e.g. "find an image for Samsung Galaxy S24" or "add a product image for Nike Air Max". ' +
      'Returns a list of image URLs you can pass directly to create_product or update_product.',
    properties: {
      query: { type: 'string',  description: 'Product name or description to search for' },
      num:   { type: 'integer', description: 'Number of results to return (default 5, max 10)' },
    },
  },
  {
    name: 'request_human_agent',
    description: 'Call this when you cannot fulfill a request or the user explicitly asks for a real person. This will notify a human agent to take over the chat.',
    properties: {
      reason: { type: 'string', description: 'Brief explanation of why the human is needed' },
    },
  },
];

// Anthropic format
const ANTHROPIC_TOOLS: Anthropic.Tool[] = TOOL_SPECS.map(t => ({
  name: t.name,
  description: t.description,
  input_schema: {
    type: 'object' as const,
    properties: Object.fromEntries(
      Object.entries(t.properties).map(([k, v]) => [k, v])
    ),
  },
}));

// Gemini format
const GEMINI_TOOLS: FunctionDeclaration[] = TOOL_SPECS.map(t => ({
  name: t.name,
  description: t.description,
  parameters: {
    type: SchemaType.OBJECT,
    properties: Object.fromEntries(
      Object.entries(t.properties).map(([k, v]) => {
        const schemaType =
          (v as any).type === 'integer' ? SchemaType.INTEGER
          : (v as any).type === 'number'  ? SchemaType.NUMBER
          : SchemaType.STRING;
        return [k, { type: schemaType, description: (v as any).description } as Schema];
      })
    ) as Record<string, Schema>,
  },
}));

// ─── Service ─────────────────────────────────────────────────────────────────
const MAX_HISTORY = 20;

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly catalog: CatalogService,
    private readonly conversationService: ConversationService,
    private readonly chatService: ChatService,
    private readonly settings: SettingsService,
  ) {}

  private async getDefaultModel(provider: 'claude' | 'gemini' | 'openai'): Promise<string> {
    const key = `default_ai_model_${provider}`;
    const saved = await this.settings.get(key);
    if (saved) return saved;

    const fallbacks: Record<string, string> = {
      claude: 'claude-3-5-haiku-20241022',
      gemini: 'gemini-1.5-flash',
      openai: 'gpt-4o-mini',
    };
    return fallbacks[provider];
  }

  clearHistory(userId: string, storeSlug: string): void {
    // History is now in DB
  }

  async chat(
    userId: string,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
    conversationId?: number,
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): Promise<ChatResult> {
    this.logger.log(`[AiChat] Message from user ${userId} for store ${storeSlug} on ${platform}: "${userMessage}"`);

    // ── Load history from DB if conversation exists ──────────────────────────
    let history: Anthropic.MessageParam[] = [];
    if (conversationId) {
      const msgs = await this.chatService.getRecentMessages(conversationId, MAX_HISTORY);
      // Convert to provider format, keeping only buyer and ai messages
      history = msgs
        .filter(m => m.senderType === 'buyer' || m.senderType === 'ai')
        .reverse() // getRecentMessages returns desc, we need asc
        .map(m => ({
          role: m.senderType === 'buyer' ? 'user' : 'assistant',
          content: m.body,
        } as Anthropic.MessageParam));
    }

    let result: ChatResult;
    if (config.provider === 'gemini') {
      result = await this.chatGemini(userId, storeSlug, storeName, retailer, userMessage, config, conversationId, history, platform);
    } else if (config.provider === 'openai') {
      result = await this.chatOpenAi(userId, storeSlug, storeName, retailer, userMessage, config, conversationId, history, platform);
    } else {
      result = await this.chatClaude(userId, storeSlug, storeName, retailer, userMessage, config, conversationId, history, platform);
    }

    // ── Unified Logging: Log AI reply ──
    if (conversationId) {
      await this.conversationService.logMessage(conversationId, storeSlug, 'ai', result.text, 'AI Bot');
    }

    return result;
  }

  // ─── Claude (Anthropic) ──────────────────────────────────────────────────
  private async chatClaude(
    userId: string,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
    conversationId?: number,
    history: Anthropic.MessageParam[] = [],
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): Promise<ChatResult> {
    const client = new Anthropic({ apiKey: config.apiKey });
    const model  = config.model || (await this.getDefaultModel('claude'));

    const formatNote = platform === 'whatsapp'
      ? `Format responses for WhatsApp: use *bold*, _italic_, and \`\`\`code\`\`\`. DO NOT use HTML tags.`
      : `Format responses for Telegram: use <b>bold</b>, <i>italic</i>, and <code>code</code>.`;

    const system = config.systemPrompt?.trim() ||
      `You are a friendly shopping assistant for "${storeName}". ` +
      `Help customers find products, answer questions about pricing, stock, and promotions. ` +
      `Use your tools to look up real store data. ${formatNote} ` +
      `Use ₱ for prices.`;

    const messages: Anthropic.MessageParam[] = [...history, { role: 'user', content: userMessage }];
    let finalText = '';
    let capturedProducts: ProductButton[] = [];
    const deadline = Date.now() + 30_000;

    for (let round = 0; round < 5; round++) {
      if (Date.now() > deadline) {
        this.logger.warn(`[AiChat] Deadline exceeded for user ${userId} (Claude)`);
        break;
      }
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        system,
        tools: ANTHROPIC_TOOLS,
        messages,
      });

      const textBlocks = response.content.filter(b => b.type === 'text');
      if (textBlocks.length) {
        finalText = textBlocks.map(b => (b as Anthropic.TextBlock).text).join('\n');
      }
      if (response.stop_reason === 'end_turn') break;

      const toolCalls = response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[];
      if (!toolCalls.length) break;

      messages.push({ role: 'assistant', content: response.content });

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolCalls) {
        const toolResult = await this.callTool(retailer, tool.name, tool.input as Record<string, unknown>, config, conversationId);
        if (tool.name === 'search_products') {
          try {
            const parsed = JSON.parse(toolResult);
            // Handle both: [{...}] array (live MCP) and { products: [...] } (cache)
            const list: any[] = Array.isArray(parsed) ? parsed : (parsed.products ?? []);
            if (list.length) {
              capturedProducts = list.map((p: any) => ({
                id: p.id, title: p.title, price: p.price ?? null,
              }));
            }
          } catch { /* not JSON */ }
        }
        results.push({ type: 'tool_result', tool_use_id: tool.id, content: toolResult });
      }
      messages.push({ role: 'user', content: results });
    }

    return {
      text:     finalText || 'Sorry, I could not process that request.',
      products: capturedProducts.length ? capturedProducts : undefined,
    };
  }

  // ─── Gemini (Google) ─────────────────────────────────────────────────────
  private async chatGemini(
    userId: string,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
    conversationId?: number,
    history: Anthropic.MessageParam[] = [],
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): Promise<ChatResult> {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const modelName = config.model || (await this.getDefaultModel('gemini'));

    const formatNote = platform === 'whatsapp'
      ? `Format responses for WhatsApp: use *bold*, _italic_, and \`\`\`code\`\`\`. DO NOT use HTML tags.`
      : `Format responses for Telegram: use <b>bold</b>, <i>italic</i>, and <code>code</code>.`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: config.systemPrompt?.trim() ||
        `You are a friendly shopping assistant for "${storeName}". ` +
        `Help customers find products, answer questions about pricing, stock, and promotions. ` +
        `Use your tools to look up real store data. ${formatNote} ` +
        `Use ₱ for prices.`,
      tools: [{ functionDeclarations: GEMINI_TOOLS }],
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: typeof h.content === 'string'
          ? [{ text: h.content }]
          : [{ text: (h.content as any[])[0]?.text ?? '' }],
      })),
    });

    let response = await chat.sendMessage(userMessage);
    let finalText = '';
    let capturedProducts: ProductButton[] = [];
    const deadline = Date.now() + 30_000;

    // Agentic tool-use loop
    for (let round = 0; round < 5; round++) {
      if (Date.now() > deadline) {
        this.logger.warn(`[AiChat] Deadline exceeded for user ${userId} (Gemini)`);
        break;
      }
      const candidate = response.response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];

      const fnCalls = parts.filter(p => p.functionCall);
      if (!fnCalls.length) {
        finalText = parts.map(p => p.text ?? '').join('').trim();
        break;
      }

      // Execute each function call sequentially so we can capture products
      const fnResults: any[] = [];
      for (const p of fnCalls) {
        const toolResult = await this.callTool(retailer, p.functionCall!.name, p.functionCall!.args as Record<string, unknown>, config, conversationId);
        if (p.functionCall!.name === 'search_products') {
          try {
            const parsed = JSON.parse(toolResult);
            // Handle both: [{...}] array (live MCP) and { products: [...] } (cache)
            const list: any[] = Array.isArray(parsed) ? parsed : (parsed.products ?? []);
            if (list.length) {
              capturedProducts = list.map((pr: any) => ({
                id: pr.id, title: pr.title, price: pr.price ?? null,
              }));
            }
          } catch { /* not JSON */ }
        }
        fnResults.push({ functionResponse: { name: p.functionCall!.name, response: { result: toolResult } } });
      }

      response = await chat.sendMessage(fnResults);
    }

    if (!finalText) {
      const parts = response.response.candidates?.[0]?.content?.parts ?? [];
      finalText = parts.map(p => p.text ?? '').join('').trim();
    }

    return {
      text:     finalText || 'Sorry, I could not process that request.',
      products: capturedProducts.length ? capturedProducts : undefined,
    };
  }

  // ─── OpenAI ──────────────────────────────────────────────────────────────
  private async chatOpenAi(
    userId: string,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
    conversationId?: number,
    history: Anthropic.MessageParam[] = [],
    platform: 'telegram' | 'whatsapp' = 'telegram',
  ): Promise<ChatResult> {
    const client = new OpenAI({ apiKey: config.apiKey });
    const model  = config.model || (await this.getDefaultModel('openai'));
    const deadline = Date.now() + 30_000;

    const formatNote = platform === 'whatsapp'
      ? `Format responses for WhatsApp: use *bold*, _italic_, and \`\`\`code\`\`\`. DO NOT use HTML tags.`
      : `Format responses for Telegram: use <b>bold</b>, <i>italic</i>, and <code>code</code>.`;

    const system = config.systemPrompt?.trim() ||
      `You are a friendly shopping assistant for "${storeName}". ` +
      `Help customers find products, answer questions about pricing, stock, and promotions. ` +
      `Use your tools to look up real store data. ${formatNote} ` +
      `Use ₱ for prices.`;

    // OpenAI tool definitions (function calling)
    const tools: OpenAI.Chat.ChatCompletionTool[] = TOOL_SPECS.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            Object.entries(t.properties).map(([k, v]) => [k, v])
          ),
        },
      },
    }));

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: typeof h.content === 'string'
          ? h.content
          : (h.content as any[])[0]?.text ?? '',
      })),
      { role: 'user', content: userMessage },
    ];

    let finalText = '';
    let capturedProducts: ProductButton[] = [];

    for (let round = 0; round < 5; round++) {
      if (Date.now() > deadline) {
        this.logger.warn(`[AiChat] Deadline exceeded for user ${userId} (OpenAI)`);
        break;
      }
      const response = await client.chat.completions.create({ model, tools, messages });
      const choice = response.choices[0];

      if (choice.finish_reason === 'stop' || !choice.message.tool_calls?.length) {
        finalText = choice.message.content ?? '';
        break;
      }

      // Process tool calls
      messages.push(choice.message);
      for (const tc of choice.message.tool_calls) {
        const fn = (tc as any).function as { name: string; arguments: string };
        const args = JSON.parse(fn.arguments || '{}');
        const result = await this.callTool(retailer, fn.name, args, config, conversationId);
        if (fn.name === 'search_products') {
          try {
            const parsed = JSON.parse(result);
            // Handle both: [{...}] array (live MCP) and { products: [...] } (cache)
            const list: any[] = Array.isArray(parsed) ? parsed : (parsed.products ?? []);
            if (list.length) {
              capturedProducts = list.map((p: any) => ({
                id: p.id, title: p.title, price: p.price ?? null,
              }));
            }
          } catch { /* not JSON */ }
        }
        messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }
    }

    return {
      text:     finalText || 'Sorry, I could not process that request.',
      products: capturedProducts.length ? capturedProducts : undefined,
    };
  }

  // ─── Shared: call a store MCP tool ──────────────────────────────────────
  private async callTool(
    retailer: RetailerTarget,
    toolName: string,
    args: Record<string, unknown>,
    config?: StoreAiConfig,
    conversationId?: number,
  ): Promise<string> {
    const startTime = Date.now();
    this.logger.log(`[AiChat] Tool Call: ${toolName} with args: ${JSON.stringify(args)}`);

    // fetch_url and search_images are handled locally — no MCP hop needed
    if (toolName === 'fetch_url') {
      const result = await this.fetchUrl(args.url as string);
      this.logger.log(`[AiChat] Tool Success: ${toolName} in ${Date.now() - startTime}ms`);
      return result;
    }
    if (toolName === 'search_images') {
      if (!config?.serperApiKey) {
        return 'Image search is not configured for this store. Ask the store owner to add a Serper API key in Settings → AI/LLM.';
      }
      const result = await this.searchImages(args.query as string, (args.num as number) ?? 5, config.serperApiKey);
      this.logger.log(`[AiChat] Tool Success: ${toolName} in ${Date.now() - startTime}ms`);
      return result;
    }

    // request_human_agent: trigger handover
    if (toolName === 'request_human_agent') {
      if (conversationId) {
        await this.conversationService.setMode(conversationId, 'human');
        await this.conversationService.logMessage(conversationId, retailer.slug, 'system', `AI requested human assistance: ${args.reason || 'No reason provided'}`);
        return 'Request sent. A human agent will take over shortly. Please tell the user that someone will be with them soon.';
      }
      return 'Error: conversation not found.';
    }

    // fallback for search_products using the local PostgreSQL cache
    if (toolName === 'search_products') {
      try {
        // Embed price constraints into the search string so parseSearchQuery picks them up
        let searchStr = (args.query as string) || '';
        const minPrice = args.min_price as number | undefined;
        const maxPrice = args.max_price as number | undefined;
        if (minPrice != null) searchStr += ` above ${minPrice}`;
        if (maxPrice != null) searchStr += ` under ${maxPrice}`;

        const limit = Math.min((args.limit as number) || 10, 50);
        const products = await this.catalog.getProducts(retailer.slug, {
          search: searchStr.trim() || undefined,
          limit,
        });

        if (products.length > 0) {
          this.logger.log(`[AiChat] Tool Success (Cache): ${toolName} found ${products.length} items in ${Date.now() - startTime}ms`);
          return JSON.stringify({
            source: 'cache',
            products: products.map(p => ({
              id: p.sellerId,
              title: p.title,
              description: p.description,
              price: p.price,
              sku: p.sku,
              stock: p.stockQuantity,
              images: p.images,
            }))
          });
        }
        this.logger.log(`[AiChat] Tool: ${toolName} not found in cache, falling back to live MCP...`);
      } catch (err) {
        this.logger.warn(`[AiChat] Local search_products failed: ${err}. Falling back to live MCP.`);
      }
    }

    try {
      const result = await callRetailerTool(retailer, toolName, args) as any;
      const text = result?.content?.map((c: any) => c.text ?? '').join('\n') ?? JSON.stringify(result);
      this.logger.log(`[AiChat] Tool Success: ${toolName} in ${Date.now() - startTime}ms`);
      return text;
    } catch (err) {
      this.logger.warn(`[AiChat] Tool "${toolName}" failed after ${Date.now() - startTime}ms: ${err}`);
      return `Error calling ${toolName}: ${err instanceof Error ? err.message : 'unknown error'}`;
    }
  }

  // ─── search_images: Google Image search via Serper API ──────────────────
  private async searchImages(query: string, num: number, serperApiKey: string): Promise<string> {
    if (!query?.trim()) return 'Error: search query is required';
    try {
      const res = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query.trim(), num: Math.min(num || 5, 10) }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) return `Error: Serper API returned ${res.status}. Check your Serper API key in Settings.`;

      const data = await res.json() as { images?: Array<{ imageUrl: string; title: string; source: string }> };
      const images = data.images ?? [];
      if (!images.length) return `No images found for "${query}".`;

      return JSON.stringify({
        images: images.slice(0, num).map(img => ({
          imageUrl: img.imageUrl,
          title:    img.title,
          source:   img.source,
        })),
        tip: 'Pass the imageUrl directly to create_product or update_product — it will be downloaded and stored automatically.',
      });
    } catch (err) {
      return `Error searching images: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // ─── fetch_url: fetch a public URL and return text + image list ──────────
  private async fetchUrl(url: string): Promise<string> {
    try {
      const res = await safeFetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        // 10-second timeout
        // @ts-ignore - custom RequestInit
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) return `Error: HTTP ${res.status} from ${url}`;

      const contentType = res.headers.get('content-type') ?? '';

      // Direct image URL — return it immediately
      if (contentType.startsWith('image/')) {
        return JSON.stringify({ type: 'image', imageUrl: url, contentType });
      }

      const html = await res.text();

      // Extract visible text (strip tags, collapse whitespace) — keep it short
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 3000);

      // Extract image URLs from src/data-src attributes
      const imgRegex = /(?:src|data-src|data-lazy-src)=["']([^"']*\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi;
      const imageUrls: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = imgRegex.exec(html)) !== null && imageUrls.length < 20) {
        const src = m[1];
        // Resolve relative URLs
        const absolute = src.startsWith('http') ? src : new URL(src, url).href;
        if (!imageUrls.includes(absolute)) imageUrls.push(absolute);
      }

      return JSON.stringify({ type: 'page', text, imageUrls });
    } catch (err) {
      return `Error fetching URL: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
