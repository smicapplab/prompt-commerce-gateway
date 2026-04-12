import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { SettingsService } from '../settings/settings.service';

const BATCH_SIZE = 10;

interface ProductInput {
  id: number;       // CachedProduct.id (gateway PK)
  title: string;
  description: string | null;
  tags: string[];
}

@Injectable()
export class TaggingService {
  private readonly logger = new Logger(TaggingService.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly settings: SettingsService,
  ) {}

  /**
   * Generate and persist aiTags for a list of products in a given store.
   * Products are batched to 10 per AI call. On any error, the batch is skipped
   * and the error is logged — callers must treat this as fire-and-forget.
   *
   * @param storeSlug  Used to fetch store context products for domain inference.
   * @param products   The products to tag (must already be persisted in DB).
   */
  async generateAndSave(storeSlug: string, products: ProductInput[]): Promise<void> {
    const [provider, apiKey, model] = await Promise.all([
      this.settings.get('gateway_ai_provider'),
      this.settings.get('gateway_ai_api_key'),
      this.settings.get('gateway_ai_model'),
    ]);

    if (!provider || !apiKey) {
      this.logger.debug('No gateway AI configured — skipping tag generation');
      return;
    }

    // 3–5 random store products for domain inference context
    const contextProducts = await this.prisma.cachedProduct.findMany({
      where: { storeSlug },
      take: 5,
      select: { title: true, description: true, tags: true },
    });

    const contextSnippet = contextProducts
      .map(p => `- ${p.title}${p.description ? ': ' + p.description.slice(0, 80) : ''}`)
      .join('\n');

    const batches: ProductInput[][] = [];
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      batches.push(products.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      try {
        const tags = await this._callAi(provider, apiKey, model, batch, contextSnippet);
        await this._persist(batch, tags);
      } catch (err: any) {
        this.logger.error(`Tag generation batch failed for store "${storeSlug}": ${err?.message}`);
        // Continue to next batch
      }
    }
  }

  /**
   * Call configured AI with the batch and context. Returns a map of product id → tags[].
   * The AI is asked to return a JSON object keyed by the product's array index.
   */
  private async _callAi(
    provider: string,
    apiKey: string,
    model: string | null,
    batch: ProductInput[],
    contextSnippet: string,
  ): Promise<Map<number, string[]>> {
    const productList = batch
      .map((p, i) =>
        `[${i}] title: "${p.title}" | description: "${(p.description ?? '').slice(0, 200)}" | manual tags: [${p.tags.join(', ')}]`,
      )
      .join('\n');

    const prompt = `You are a product tagging assistant. Generate semantic search tags for each product below.

STORE CONTEXT (sample products to understand what this store sells):
${contextSnippet || '(no context available)'}

PRODUCTS TO TAG:
${productList}

Rules:
- Generate 5–15 lowercase tags per product
- Tags must describe what the product IS, what it's FOR, who uses it, materials, flavors, destinations, etc. — whatever is relevant for this domain
- Be domain-agnostic: for shoes use activity/type tags; for food use ingredients/cuisine; for electronics use use-case/compatibility; for airlines use route/class/airline
- Include synonyms and related terms users might search (e.g., for "Nike Air Jordan 1": ["basketball", "sneakers", "high-top", "retro", "streetwear", "men", "sports"])
- Do NOT repeat words already in the title unless they are semantically important synonyms
- Return ONLY valid JSON, no prose: { "0": ["tag1","tag2"], "1": ["tag1","tag2"], ... }`;

    let responseText: string;

    if (provider === 'claude') {
      responseText = await this._callClaude(apiKey, model ?? 'claude-3-5-haiku-20241022', prompt);
    } else if (provider === 'openai') {
      responseText = await this._callOpenAi(apiKey, model ?? 'gpt-4o-mini', prompt);
    } else if (provider === 'gemini') {
      responseText = await this._callGemini(apiKey, model ?? 'gemini-1.5-flash', prompt);
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    // Strip markdown code fences that some models include despite instructions
    const cleaned = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    const result = new Map<number, string[]>();
    for (const [key, tags] of Object.entries(parsed)) {
      const idx = parseInt(key, 10);
      if (!isNaN(idx) && Array.isArray(tags)) {
        result.set(idx, (tags as unknown[]).map(String).map(t => t.toLowerCase().trim()));
      }
    }
    return result;
  }

  private async _callClaude(apiKey: string, model: string, prompt: string): Promise<string> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = msg.content[0];
    if (block.type !== 'text') throw new Error('Unexpected Claude response type');
    return block.text;
  }

  private async _callOpenAi(apiKey: string, model: string, prompt: string): Promise<string> {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey });
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });
    return res.choices[0]?.message?.content ?? '{}';
  }

  private async _callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model: model ?? 'gemini-1.5-flash' });
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  }

  /** Write the generated tags back to each CachedProduct row. */
  private async _persist(batch: ProductInput[], tags: Map<number, string[]>): Promise<void> {
    const updates = Array.from(tags.entries()).map(([idx, aiTags]) => {
      const product = batch[idx];
      if (!product) return null;
      return this.prisma.cachedProduct.update({
        where: { id: product.id },
        data: { aiTags },
      });
    }).filter(Boolean) as Promise<any>[];

    await Promise.all(updates);
  }

  /**
   * Backfill all products for a store that have no aiTags yet.
   * Used by the admin backfill endpoint.
   */
  async backfill(storeSlug: string): Promise<{ queued: number }> {
    const products = await this.prisma.cachedProduct.findMany({
      where: { storeSlug, aiTags: { equals: [] } },
      select: { id: true, title: true, description: true, tags: true },
    });

    if (!products.length) return { queued: 0 };

    // Fire-and-forget — caller gets the count immediately
    this.generateAndSave(storeSlug, products).catch(err =>
      this.logger.error(`Backfill failed for "${storeSlug}": ${err?.message}`),
    );

    return { queued: products.length };
  }
}
