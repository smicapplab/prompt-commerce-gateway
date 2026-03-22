import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  GoogleGenerativeAI,
  type FunctionDeclaration,
  type Schema,
  SchemaType,
} from '@google/generative-ai';
import { callRetailerTool, type RetailerTarget } from '../mcp/retailer-client';

// ─── Store AI config (read from Retailer row) ────────────────────────────────
export interface StoreAiConfig {
  provider:     'claude' | 'gemini';
  apiKey:       string;
  model?:       string | null;
  systemPrompt?: string | null;  // custom persona set by the store owner
}

const DEFAULT_MODELS: Record<string, string> = {
  claude: 'claude-haiku-4-5-20251001',
  gemini: 'gemini-1.5-flash',
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
          content: await this.callTool(retailer, tool.name, tool.input as Record<string, unknown>),
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
            response: { result: await this.callTool(retailer, p.functionCall!.name, p.functionCall!.args as Record<string, unknown>) },
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

  // ─── Shared: call a store MCP tool ──────────────────────────────────────
  private async callTool(
    retailer: RetailerTarget,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    try {
      const result = await callRetailerTool(retailer, toolName, args) as any;
      return result?.content?.map((c: any) => c.text ?? '').join('\n') ?? JSON.stringify(result);
    } catch (err) {
      this.logger.warn(`Tool "${toolName}" failed: ${err}`);
      return `Error calling ${toolName}: ${err instanceof Error ? err.message : 'unknown error'}`;
    }
  }
}
