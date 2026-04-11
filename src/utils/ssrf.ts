import dns from 'dns/promises';
import http from 'http';
import https from 'https';

/**
 * Returns true if the IPv4 address falls in a private / link-local / loopback range.
 */
export function isPrivateIp(ip: string): boolean {
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
 * Validates that a URL is safe from SSRF by checking its protocol and resolving
 * the hostname to ensure it doesn't point to a private IP range.
 * 
 * NOTE: This is still vulnerable to DNS rebinding if used followed by a separate fetch()
 * Use safeFetch() instead for end-to-end protection.
 */
export async function isSsrfSafe(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    // Only allow http/https schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    
    // Block numeric IP hostnames that are private
    const host = parsed.hostname;
    // If it's already a dotted-decimal IPv4, check directly
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return !isPrivateIp(host);
    }
    
    // Resolve the hostname and check all returned IPs
    const addresses = await dns.resolve4(host).catch(() => [] as string[]);
    if (!addresses.length) return false; // unresolvable — block
    
    return addresses.every(ip => !isPrivateIp(ip));
  } catch {
    return false;
  }
}

/**
 * Resolves a hostname to an IPv4 address and validates that it is safe (not private).
 * Returns the safe IP address.
 */
export async function resolveSafeIp(hostname: string): Promise<string> {
  // If it's already a dotted-decimal IPv4, check directly
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error(`SSRF blocked: ${hostname} is a private IP`);
    }
    return hostname;
  }

  // Resolve the hostname and check all returned IPs
  const addresses = await dns.resolve4(hostname);
  if (!addresses.length) {
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  // Check all IPs, pick the first safe one
  const safeIps = addresses.filter(addr => !isPrivateIp(addr));
  if (safeIps.length === 0) {
    throw new Error(`SSRF blocked: ${hostname} resolved to unsafe IPs: ${addresses.join(', ')}`);
  }

  return safeIps[0];
}

/**
 * A fetch-like implementation that pins the resolved IP to prevent DNS rebinding.
 */
export async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  const parsed = new URL(url);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname;
  const ip = await resolveSafeIp(hostname);

  // We use the original URL but inject a custom lookup function to the agent
  const lookup = (_hostname: string, _options: any, callback: any) => {
    callback(null, ip, 4);
  };

  const agentOptions = { lookup };
  const agent = parsed.protocol === 'https:' 
    ? new https.Agent(agentOptions)
    : new http.Agent(agentOptions);

  // Use global fetch with the custom dispatcher if available (Node 18+)
  // or fallback to a custom implementation.
  try {
    // @ts-ignore - 'dispatcher' is supported in undici-based fetch
    return await fetch(url, {
      ...init,
      dispatcher: agent,
    } as any);
  } catch (e) {
    // If 'dispatcher' is not supported or fails, fallback to manual http/https request
    return new Promise((resolve, reject) => {
      const module = parsed.protocol === 'https:' ? https : http;
      const headers = init?.headers ? (init.headers as any) : {};
      
      const req = module.request(url, {
        method: init?.method || 'GET',
        headers,
        lookup,
        timeout: 10000,
      }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve(new Response(body, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers as any,
          }));
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (init?.body) {
        req.write(init.body);
      }
      req.end();
    });
  }
}
