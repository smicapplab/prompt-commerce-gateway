import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { resolveSafeIp } from '../utils/ssrf';

export interface RetailerTarget {
  slug: string;
  mcpServerUrl: string;
  platformKey: string;
}

interface PoolEntry {
  client: Client;
  transport: SSEClientTransport;
  timer?: NodeJS.Timeout;
}

const connectionPool = new Map<string, PoolEntry>();
const IDLE_TIMEOUT = 30000;

// BUG-2: This is a pure synchronous string concatenation — no need for async.
function getResourceKey(retailer: RetailerTarget): string {
  return `${retailer.mcpServerUrl}|${retailer.platformKey}`;
}

/**
 * Calls a single tool on a retailer's self-hosted MCP server.
 * Uses a connection pool to reuse established SSE connections.
 */
export async function callRetailerTool(
  retailer: RetailerTarget,
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const key = getResourceKey(retailer);
  let entry = connectionPool.get(key);

  if (entry?.timer) {
    clearTimeout(entry.timer);
    entry.timer = undefined;
  }

  if (!entry) {
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

    try {
      await client.connect(transport);
      entry = { client, transport };
      connectionPool.set(key, entry);
    } catch (err) {
      await client.close().catch(() => { });
      throw err;
    }
  }

  const { client } = entry;

  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`MCP timeout after 30s calling "${toolName}"`)), 30000);
  });

  try {
    const callPromise = client.callTool({ name: toolName, arguments: args });
    return await Promise.race([callPromise, timeoutPromise]);
  } catch (err) {
    // If the connection died, remove it from pool
    connectionPool.delete(key);
    await client.close().catch(() => { });
    throw err;
  } finally {
    clearTimeout(timeoutHandle!);

    // Set idle timer to close connection if not used
    const currentEntry = connectionPool.get(key);
    if (currentEntry) {
      currentEntry.timer = setTimeout(async () => {
        try {
          await currentEntry.client.close();
        } catch { }
        connectionPool.delete(key);
      }, IDLE_TIMEOUT);
    }
  }
}

/**
 * Healthcheck — tries to list tools on a retailer's MCP server.
 * Used to verify the MCP URL and key are working during onboarding.
 */
export async function pingRetailer(retailer: RetailerTarget): Promise<boolean> {
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