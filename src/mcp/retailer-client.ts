import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export interface RetailerTarget {
  slug: string;
  mcpServerUrl: string;
  platformKey: string;
}

/**
 * Calls a single tool on a retailer's self-hosted MCP server.
 * Creates a fresh client per call — simple and stateless for the prototype.
 * Add connection pooling later when you need performance.
 */
export async function callRetailerTool(
  retailer: RetailerTarget,
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const client = new Client(
    { name: 'prompt-commerce-gateway', version: '1.0.0' },
    { capabilities: {} },
  );

  const sseUrl = new URL(`${retailer.mcpServerUrl}/sse`);

  const transport = new SSEClientTransport(sseUrl, {
    requestInit: {
      headers: {
        'x-gateway-key': retailer.platformKey,
      },
    },
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({ name: toolName, arguments: args });
    return result;
  } finally {
    await client.close().catch(() => {/* ignore close errors */});
  }
}

/**
 * Healthcheck — tries to list tools on a retailer's MCP server.
 * Used to verify the MCP URL and key are working during onboarding.
 */
export async function pingRetailer(retailer: RetailerTarget): Promise<boolean> {
  const client = new Client(
    { name: 'prompt-commerce-gateway', version: '1.0.0' },
    { capabilities: {} },
  );

  const transport = new SSEClientTransport(
    new URL(`${retailer.mcpServerUrl}/sse`),
    { requestInit: { headers: { 'x-gateway-key': retailer.platformKey } } },
  );

  try {
    await client.connect(transport);
    await client.listTools();
    return true;
  } catch {
    return false;
  } finally {
    await client.close().catch(() => {});
  }
}
