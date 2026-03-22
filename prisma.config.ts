import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Prisma 7 does not auto-load .env when evaluating prisma.config.ts,
// so we load it explicitly here.
config({ path: resolve(__dirname, '.env'), quiet: true });

/**
 * Prisma 7 — datasource URLs belong here, not in schema.prisma.
 *
 * DIRECT_DATABASE_URL is used for all CLI operations (generate, migrate,
 * studio). It must be a direct TCP connection — no connection pooler:
 *
 *   Local Docker:  DIRECT_DATABASE_URL = DATABASE_URL  (same value, port 5433)
 *   Supabase:      DIRECT_DATABASE_URL = direct URL     (port 5432, not 6543)
 *
 * The runtime PrismaClient uses DATABASE_URL (pooler-safe) which is configured
 * via the adapter passed to new PrismaClient() in prisma.module.ts.
 */
export default defineConfig({
  schema: './prisma/schema',
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  },
});
