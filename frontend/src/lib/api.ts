// Reads VITE_API_BASE at build time (Vercel env var)
// Falls back to '' for same-origin (PM2/Docker deployment stays unchanged)
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

// SEC-A: Always send credentials (httpOnly cookie) so the JWT is never
// accessible to JavaScript. The cookie is set by POST /api/auth/login.
export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, { credentials: 'include', ...init });
