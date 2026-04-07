// Reads VITE_API_BASE at build time (Vercel env var)
// Falls back to '' for same-origin (PM2/Docker deployment stays unchanged)
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, init);
