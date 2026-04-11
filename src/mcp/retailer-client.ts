import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { resolveSafeIp } from '../utils/ssrf';

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
  // SEC-2: Validate URL and pin IP to prevent DNS rebinding SSRF
  const sseUrl = new URL(`${retailer.mcpServerUrl}/sse/${retailer.slug}`);
  const originalHostname = sseUrl.hostname;
  const safeIp = await resolveSafeIp(originalHostname);
  sseUrl.hostname = safeIp;

  const client = new Client(
    { name: 'prompt-commerce-gateway', version: '1.0.0' },
    { capabilities: {} },
  );

  const transport = new SSEClientTransport(sseUrl, {
    requestInit: {
      headers: {
        'x-gateway-key': retailer.platformKey,
        'Host': originalHostname,
      },
    },
  });

  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`MCP timeout after 30s calling "${toolName}"`)), 30000);
  });

  try {
    const callPromise = (async () => {
      await client.connect(transport);
      return await client.callTool({ name: toolName, arguments: args });
    })();
    return await Promise.race([callPromise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
    await client.close().catch(() => { });
  }
}

/**
 * Healthcheck — tries to list tools on a retailer's MCP server.
 * Used to verify the MCP URL and key are working during onboarding.
 */
export async function pingRetailer(retailer: RetailerTarget): Promise<boolean> {
  // SEC-2: Validate URL and pin IP to prevent DNS rebinding SSRF
  const sseUrl = new URL(`${retailer.mcpServerUrl}/sse/${retailer.slug}`);
  const originalHostname = sseUrl.hostname;
  const safeIp = await resolveSafeIp(originalHostname);
  sseUrl.hostname = safeIp;

  const client = new Client(
    { name: 'prompt-commerce-gateway', version: '1.0.0' },
    { capabilities: {} },
  );

  const transport = new SSEClientTransport(sseUrl, {
    requestInit: {
      headers: {
        'x-gateway-key': retailer.platformKey,
        'Host': originalHostname,
      },
    },
  });

  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('MCP timeout after 10s during ping')), 10000);
  });

  try {
    const pingPromise = (async () => {
      await client.connect(transport);
      await client.listTools();
      return true;
    })();
    return await Promise.race([pingPromise, timeoutPromise]) as boolean;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutHandle!);
    await client.close().catch(() => { });
  }
}