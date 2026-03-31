import dns from 'dns/promises';

/**
 * Returns true if the IPv4 address falls in a private / link-local / loopback range.
 */
function isPrivateIp(ip: string): boolean {
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
