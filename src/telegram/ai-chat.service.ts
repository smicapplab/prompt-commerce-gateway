import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  GoogleGenerativeAI,
  type FunctionDeclaration,
  type Schema,
  SchemaType,
} from '@google/generative-ai';
import OpenAI from 'openai';
import { callRetailerTool, type RetailerTarget } from '../mcp/retailer-client';

// ─── Store AI config (read from Retailer row) ────────────────────────────────
export interface StoreAiConfig {
  provider:      'claude' | 'gemini' | 'openai';
  apiKey:        string;
  model?:        string | null;
  systemPrompt?: string | null;  // custom persona set by the store owner
  serperApiKey?: string | null;  // for search_images tool
}

const DEFAULT_MODELS: Record<string, string> = {
  claude: 'claude-haiku-4-5-20251001',
  gemini: 'gemini-1.5-flash',
  openai: 'gpt-4o-mini',
};

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

// ─── Conversation history ────────────────────────────────────────────────────
const histories = new Map<string, Anthropic.MessageParam[]>();
const MAX_HISTORY = 20;

// ─── Service ─────────────────────────────────────────────────────────────────
@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  clearHistory(userId: number, storeSlug: string): void {
    histories.delete(`${userId}:${storeSlug}`);
  }

  async chat(
    userId: number,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
  ): Promise<string> {
    if (config.provider === 'gemini') {
      return this.chatGemini(userId, storeSlug, storeName, retailer, userMessage, config);
    }
    if (config.provider === 'openai') {
      return this.chatOpenAi(userId, storeSlug, storeName, retailer, userMessage, config);
    }
    return this.chatClaude(userId, storeSlug, storeName, retailer, userMessage, config);
  }

  // ─── Claude (Anthropic) ──────────────────────────────────────────────────
  private async chatClaude(
    userId: number,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
  ): Promise<string> {
    const client = new Anthropic({ apiKey: config.apiKey });
    const model  = config.model ?? DEFAULT_MODELS.claude;
    const histKey = `${userId}:${storeSlug}`;

    const history = histories.get(histKey) ?? [];
    history.push({ role: 'user', content: userMessage });

    const system = config.systemPrompt?.trim() ||
      `You are a friendly shopping assistant for "${storeName}". ` +
      `Help customers find products, answer questions about pricing, stock, and promotions. ` +
      `Use your tools to look up real store data. Format responses concisely for Telegram. ` +
      `Use ₱ for prices.`;

    let messages: Anthropic.MessageParam[] = [...history];
    let finalText = '';

    for (let round = 0; round < 5; round++) {
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
        results.push({
          type: 'tool_result',
          tool_use_id: tool.id,
          content: await this.callTool(retailer, tool.name, tool.input as Record<string, unknown>, config),
        });
      }
      messages.push({ role: 'user', content: results });
    }

    history.push({ role: 'assistant', content: finalText || 'Sorry, I could not process that.' });
    histories.set(histKey, history.slice(-MAX_HISTORY));
    return finalText || 'Sorry, I could not process that request.';
  }

  // ─── Gemini (Google) ─────────────────────────────────────────────────────
  private async chatGemini(
    userId: number,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({
      model: config.model ?? DEFAULT_MODELS.gemini,
      systemInstruction: config.systemPrompt?.trim() ||
        `You are a friendly shopping assistant for "${storeName}". ` +
        `Help customers find products, answer questions about pricing, stock, and promotions. ` +
        `Use your tools to look up real store data. Format responses concisely for Telegram. ` +
        `Use ₱ for prices.`,
      tools: [{ functionDeclarations: GEMINI_TOOLS }],
    });

    // Build Gemini-format history (excludes the current message)
    const histKey = `${userId}:${storeSlug}`;
    const history = histories.get(histKey) ?? [];

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

    // Agentic tool-use loop
    for (let round = 0; round < 5; round++) {
      const candidate = response.response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];

      const fnCalls = parts.filter(p => p.functionCall);
      if (!fnCalls.length) {
        finalText = parts.map(p => p.text ?? '').join('').trim();
        break;
      }

      // Execute each function call and feed results back
      const fnResults = await Promise.all(
        fnCalls.map(async p => ({
          functionResponse: {
            name: p.functionCall!.name,
            response: { result: await this.callTool(retailer, p.functionCall!.name, p.functionCall!.args as Record<string, unknown>, config) },
          },
        }))
      );

      response = await chat.sendMessage(fnResults);
    }

    if (!finalText) {
      const parts = response.response.candidates?.[0]?.content?.parts ?? [];
      finalText = parts.map(p => p.text ?? '').join('').trim();
    }

    // Update history
    history.push(
      { role: 'user',      content: userMessage },
      { role: 'assistant', content: finalText || 'Sorry, I could not process that.' },
    );
    histories.set(histKey, history.slice(-MAX_HISTORY));
    return finalText || 'Sorry, I could not process that request.';
  }

  // ─── OpenAI ──────────────────────────────────────────────────────────────
  private async chatOpenAi(
    userId: number,
    storeSlug: string,
    storeName: string,
    retailer: RetailerTarget,
    userMessage: string,
    config: StoreAiConfig,
  ): Promise<string> {
    const client = new OpenAI({ apiKey: config.apiKey });
    const model  = config.model ?? DEFAULT_MODELS.openai;
    const histKey = `${userId}:${storeSlug}`;

    const system = config.systemPrompt?.trim() ||
      `You are a friendly shopping assistant for "${storeName}". ` +
      `Help customers find products, answer questions about pricing, stock, and promotions. ` +
      `Use your tools to look up real store data. Format responses concisely for Telegram. ` +
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

    // Build message history in OpenAI format
    const history = histories.get(histKey) ?? [];
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

    for (let round = 0; round < 5; round++) {
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
        const result = await this.callTool(retailer, fn.name, args, config);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        });
      }
    }

    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: finalText || 'Sorry, I could not process that.' });
    histories.set(histKey, history.slice(-MAX_HISTORY));
    return finalText || 'Sorry, I could not process that request.';
  }

  // ─── Shared: call a store MCP tool ──────────────────────────────────────
  private async callTool(
    retailer: RetailerTarget,
    toolName: string,
    args: Record<string, unknown>,
    config?: StoreAiConfig,
  ): Promise<string> {
    // fetch_url and search_images are handled locally — no MCP hop needed
    if (toolName === 'fetch_url') {
      return this.fetchUrl(args.url as string);
    }
    if (toolName === 'search_images') {
      if (!config?.serperApiKey) {
        return 'Image search is not configured for this store. Ask the store owner to add a Serper API key in Settings → AI/LLM.';
      }
      return this.searchImages(args.query as string, (args.num as number) ?? 5, config.serperApiKey);
    }

    try {
      const result = await callRetailerTool(retailer, toolName, args) as any;
      return result?.content?.map((c: any) => c.text ?? '').join('\n') ?? JSON.stringify(result);
    } catch (err) {
      this.logger.warn(`Tool "${toolName}" failed: ${err}`);
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
    if (!url?.startsWith('http')) {
      return 'Error: URL must start with http:// or https://';
    }
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        // 10-second timeout
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
