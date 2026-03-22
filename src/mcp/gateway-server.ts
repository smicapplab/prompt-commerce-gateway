import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import express from 'express';
import { RegistryService } from '../registry/registry.service';
import { callRetailerTool, pingRetailer } from './retailer-client';

/**
 * Mounts the MCP gateway onto an Express app.
 *
 * The gateway acts as a single MCP server that users connect to once.
 * Internally it fans out to individual retailer MCP servers using
 * the retailer-client module.
 *
 * Routes added:
 *   GET  /sse       — MCP SSE connection endpoint
 *   POST /messages  — MCP message endpoint
 */
export function mountGatewayMcp(
  app: express.Application,
  registry: RegistryService,
): void {
  // ── Helper: resolve retailer or throw ──────────────────────────────────────
  async function getActiveRetailer(slug: string) {
    const retailer = await registry.findBySlug(slug);
    if (!retailer.verified || !retailer.active) {
      throw new Error(`Store "${slug}" is not currently available.`);
    }
    if (!retailer.platformKey || retailer.platformKey.revokedAt) {
      throw new Error(`Store "${slug}" has no active platform key.`);
    }
    return {
      slug: retailer.slug,
      mcpServerUrl: retailer.mcpServerUrl,
      platformKey: retailer.platformKey.key,
    };
  }

  // ── Factory: create a fresh McpServer per connection ──────────────────────
  // The MCP SDK only supports one active transport per McpServer instance.
  // Creating a new server per SSE connection allows multiple concurrent clients.
  function createServer(): McpServer {
    const server = new McpServer({
      name: 'prompt-commerce-gateway',
      version: '1.0.0',
    });

    // ── Tool: list_stores ────────────────────────────────────────────────────
    server.tool(
      'list_stores',
      'List all verified retailers registered on the Prompt Commerce gateway.',
      {},
      async () => {
        const retailers = await registry.findActiveRetailers();
        const stores = retailers.map((r) => ({
          slug: r.slug,
          name: r.name,
        }));
        return {
          content: [
            {
              type: 'text',
              text: stores.length
                ? JSON.stringify(stores, null, 2)
                : 'No stores are currently registered.',
            },
          ],
        };
      },
    );

    // ── Tool: search_products ────────────────────────────────────────────────
    server.tool(
      'search_products',
      'Search for products in a specific store by keyword, category, or price range.',
      {
        store: z.string().describe('Store slug (from list_stores)'),
        query: z.string().optional().describe('Search keyword'),
        category: z.string().optional().describe('Filter by category name'),
        min_price: z.number().optional().describe('Minimum price'),
        max_price: z.number().optional().describe('Maximum price'),
        limit: z.number().int().min(1).max(50).default(20).describe('Max results'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'search_products', args);
        return result as never;
      },
    );

    // ── Tool: get_product ────────────────────────────────────────────────────
    server.tool(
      'get_product',
      'Get full details for a single product from a specific store.',
      {
        store: z.string().describe('Store slug'),
        id: z.number().int().optional().describe('Product ID'),
        sku: z.string().optional().describe('Product SKU'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'get_product', args);
        return result as never;
      },
    );

    // ── Tool: list_categories ────────────────────────────────────────────────
    server.tool(
      'list_categories',
      'List product categories available in a specific store.',
      {
        store: z.string().describe('Store slug'),
      },
      async ({ store }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'list_categories', {});
        return result as never;
      },
    );

    // ── Tool: get_promotions ─────────────────────────────────────────────────
    server.tool(
      'get_promotions',
      'Get active promotions and voucher codes from a specific store.',
      {
        store: z.string().describe('Store slug'),
      },
      async ({ store }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'get_promotions', {
          include_expired: false,
        });
        return result as never;
      },
    );

    // ── Tool: get_reviews ────────────────────────────────────────────────────
    server.tool(
      'get_reviews',
      'Get customer reviews for a product in a specific store.',
      {
        store: z.string().describe('Store slug'),
        product_id: z.number().int().describe('Product ID'),
      },
      async ({ store, product_id }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'get_reviews', { product_id });
        return result as never;
      },
    );

    // ── Tool: ping_store ─────────────────────────────────────────────────────
    server.tool(
      'ping_store',
      'Check if a store\'s MCP server is reachable. Useful for troubleshooting.',
      {
        store: z.string().describe('Store slug'),
      },
      async ({ store }) => {
        const retailer = await getActiveRetailer(store);
        const online = await pingRetailer(retailer);
        return {
          content: [
            {
              type: 'text',
              text: online
                ? `✅ ${store} is online and reachable.`
                : `❌ ${store} is unreachable. The retailer's server may be down.`,
            },
          ],
        };
      },
    );

    // ── Tool: add_product ────────────────────────────────────────────────────
    server.tool(
      'add_product',
      'Add a new product to a store\'s catalog. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        title: z.string().min(1).describe('Product title'),
        description: z.string().optional().describe('Product description'),
        sku: z.string().optional().describe('Stock-keeping unit (unique identifier)'),
        category: z.string().optional().describe('Category name — will be created if it does not exist'),
        price: z.number().min(0).optional().describe('Price in local currency'),
        stock_quantity: z.number().int().min(0).default(0).describe('Initial stock level'),
        tags: z.array(z.string()).optional().describe('Tags for search and filtering'),
        images: z.array(z.string()).optional().describe('Image URLs'),
        confirm: z.boolean().default(false).describe('Set to true to actually save. When false (default), returns a preview for review.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'add_product', args);
        return result as never;
      },
    );

    // ── Tool: update_product ─────────────────────────────────────────────────
    server.tool(
      'update_product',
      'Update fields on an existing product. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        id: z.number().int().describe('ID of the product to update'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        sku: z.string().optional().describe('New SKU'),
        category: z.string().optional().describe('New category name'),
        price: z.number().min(0).optional().describe('New price'),
        stock_quantity: z.number().int().min(0).optional().describe('New stock level'),
        tags: z.array(z.string()).optional().describe('Replacement tag list'),
        images: z.array(z.string()).optional().describe('Replacement image URLs'),
        active: z.boolean().optional().describe('Set to false to delist the product'),
        confirm: z.boolean().default(false).describe('Set to true to actually save. When false (default), returns a preview for review.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'update_product', args);
        return result as never;
      },
    );

    // ── Tool: update_inventory ───────────────────────────────────────────────
    server.tool(
      'update_inventory',
      'Update the stock quantity for a product by ID or SKU. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        id: z.number().int().optional().describe('Product ID'),
        sku: z.string().optional().describe('Product SKU'),
        quantity: z.number().int().describe('The new total stock quantity'),
        confirm: z.boolean().default(false).describe('Set to true to actually save. When false (default), returns a preview for review.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'update_inventory', args);
        return result as never;
      },
    );

    // ── Tool: import_products ────────────────────────────────────────────────
    server.tool(
      'import_products',
      'Bulk import or update products from a local Excel (.xlsx) or CSV file on the seller\'s machine. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        file_path: z.string().describe('Absolute path to the Excel or CSV file on the seller\'s machine'),
        confirm: z.boolean().default(false).describe('Set to true to actually save. When false (default), returns a preview for review.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'import_products', args);
        return result as never;
      },
    );

    // ── Tool: add_category ───────────────────────────────────────────────────
    server.tool(
      'add_category',
      'Create a new product category in a store. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        name: z.string().min(1).describe('Category name (must be unique)'),
        parent_id: z.number().int().optional().describe('Parent category ID for sub-categories'),
        confirm: z.boolean().default(false).describe('Set to true to actually save. When false (default), returns a preview for review.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'add_category', args);
        return result as never;
      },
    );

    // ── Tool: batch_add_categories ───────────────────────────────────────────
    server.tool(
      'batch_add_categories',
      'Create multiple product categories at once, with optional hierarchy. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        categories: z.array(z.object({
          name: z.string().min(1).describe('Category name'),
          parent_name: z.string().optional().describe('Name of the parent category'),
        })).describe('List of categories to create'),
        confirm: z.boolean().default(false).describe('Set to true to actually save.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'batch_add_categories', args);
        return result as never;
      },
    );

    // ── Tool: update_category ────────────────────────────────────────────────
    server.tool(
      'update_category',
      'Update an existing category name or parent. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        id: z.number().int().describe('Category ID to update'),
        name: z.string().min(1).optional().describe('New category name'),
        parent_id: z.number().int().nullable().optional().describe('New parent category ID (null for top-level)'),
        confirm: z.boolean().default(false).describe('Set to true to actually save.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'update_category', args);
        return result as never;
      },
    );

    // ── Tool: add_promotion ──────────────────────────────────────────────────
    server.tool(
      'add_promotion',
      'Create a promotion or voucher code for a store. Returns a preview by default — set confirm=true to save.',
      {
        store: z.string().describe('Store slug'),
        title: z.string().min(1).describe('Promotion name/title'),
        discount_type: z.enum(['percentage', 'fixed']).describe('"percentage" or "fixed"'),
        discount_value: z.number().min(0).describe('Discount amount'),
        product_id: z.number().int().optional().describe('Apply only to this product ID (omit for store-wide)'),
        voucher_code: z.string().optional().describe('Unique voucher code customers can enter'),
        start_date: z.string().optional().describe('ISO date when the promotion starts (YYYY-MM-DD)'),
        end_date: z.string().optional().describe('ISO date when the promotion ends (YYYY-MM-DD)'),
        confirm: z.boolean().default(false).describe('Set to true to actually save. When false (default), returns a preview for review.'),
      },
      async ({ store, ...args }) => {
        const retailer = await getActiveRetailer(store);
        const result = await callRetailerTool(retailer, 'add_promotion', args);
        return result as never;
      },
    );

    return server;
  }

  // ── SSE transport setup ───────────────────────────────────────────────────
  const transports = new Map<string, SSEServerTransport>();

  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);
    res.on('close', () => transports.delete(transport.sessionId));
    // Create a fresh McpServer for this connection to avoid the
    // "Already connected to a transport" error on reconnects/multiple clients.
    const server = createServer();
    await server.connect(transport);
  });

  app.post('/messages', async (req, res) => {
    const sessionId = req.query['sessionId'] as string | undefined;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId.' });
      return;
    }
    const transport = transports.get(sessionId);
    if (!transport) {
      res.status(404).json({ error: 'Session not found.' });
      return;
    }
    await transport.handlePostMessage(req, res);
  });
}
