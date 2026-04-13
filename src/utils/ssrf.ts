import dns from 'dns/promises';
import http from 'http';
import https from 'https';

/**
 * Returns true if the IPv4 address falls in a private / link-local / loopback range.
 */
export function isPrivateIp(ip: string | undefined): boolean {
  if (!ip) return true;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // treat malformed IPs as unsafe
  }
  const [a, b] = parts;
  return (
    a === 127 ||                           // 127.0.0.0/8   loopback
    a === 10 ||                            // 10.0.0.0/8    private
    a === 0 ||                             // 0.0.0.0/8     "this" network
    (a === 172 && b >= 16 && b <= 31) ||   // 172.16.0.0/12 private
    (a === 192 && b === 168) ||            // 192.168.0.0/16 private
    (a === 169 && b === 254) ||            // 169.254.0.0/16 link-local
    (a === 100 && b >= 64 && b <= 127) ||  // 100.64.0.0/10  CGNAT
    a === 198 && b === 51 && parts[2] === 100 || // 198.51.100.0/24 TEST-NET-2
    a === 203 && b === 0   && parts[2] === 113   // 203.0.113.0/24  TEST-NET-3
  );
}

/**
 * Returns true if the IPv6 address falls in a private/loopback/link-local range.
 */
export function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
    normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('ff')) return true;
  return false;
}

/**
 * Resolves a hostname to an IPv4 address and validates that it is safe.
 */
export async function resolveSafeIp(hostname: string): Promise<string> {
  const isDev = process.env.NODE_ENV === 'development';

  // Explicitly allow localhost in dev mode
  if (isDev && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return '127.0.0.1';
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    if (!isDev && isPrivateIp(hostname)) {
      throw new Error(`SSRF blocked: ${hostname} is a private IP`);
    }
    return hostname;
  }

  if (hostname.includes(':')) {
    if (!isDev && isPrivateIpv6(hostname)) {
      throw new Error(`SSRF blocked: ${hostname} is a private IPv6 address`);
    }
    return hostname;
  }

  try {
    const addresses = await dns.resolve4(hostname);
    if (!addresses.length) throw new Error(`Could not resolve: ${hostname}`);

    const safeIps = isDev ? addresses : addresses.filter(addr => !isPrivateIp(addr));
    if (safeIps.length === 0) {
      throw new Error(`SSRF blocked: ${hostname} resolved to unsafe IPs`);
    }
    return safeIps[0];
  } catch (err: any) {
    if (isDev && hostname === 'localhost') return '127.0.0.1';
    throw err;
  }
}

/**
 * Validates that a URL is safe from SSRF by checking its protocol and resolving
 * the hostname to ensure it doesn't point to a private IP range.
 */
export async function isSsrfSafe(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const host = parsed.hostname;
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && (host === 'localhost' || host === '127.0.0.1')) return true;

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return !isPrivateIp(host);
    }

    if (host.includes(':')) {
      return !isPrivateIpv6(host);
    }

    const addresses = await dns.resolve4(host).catch(() => [] as string[]);
    if (!addresses.length) return false;

    return addresses.every(ip => !isPrivateIp(ip));
  } catch {
    return false;
  }
}

/**
 * A fetch-like implementation that pins the resolved IP to prevent DNS rebinding.
 */
export async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const ip = await resolveSafeIp(hostname);

  const lookup = (_hostname: string, _options: any, callback: any) => {
    callback(null, ip, 4);
  };

  const agentOptions = { lookup };
  const agent = parsed.protocol === 'https:'
    ? new https.Agent(agentOptions)
    : new http.Agent(agentOptions);

  try {
    // @ts-ignore
    return await fetch(url, { ...init, dispatcher: agent } as any);
  } catch (e) {
    return new Promise((resolve, reject) => {
      const module = parsed.protocol === 'https:' ? https : http;
      const headers = init?.headers ? (init.headers as any) : {};
      const req = module.request(url, {
        method: init?.method || 'GET',
        headers,
        lookup,
        timeout: 10000,
      }, (res) => {
        const chunks: any[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve(new Response(Buffer.concat(chunks), {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers as any,
          }));
        });
      });
      req.on('error', reject);
      if (init?.body) req.write(init.body);
      req.end();
    });
  }
}
