import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';

// PERF-1: In-memory TTL cache so hot paths (payment initiation, AI chat, etc.)
// don't round-trip to the DB for every request. Settings change infrequently.
interface CacheEntry { value: string | null; expiry: number }
const CACHE_TTL_MS = 60_000; // 60 seconds

@Injectable()
export class SettingsService implements OnApplicationBootstrap {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async onApplicationBootstrap() {
    const defaults = [
      { key: 'default_payment_provider', value: 'cod' },
      { key: 'default_payment_instructions', value: '' },
      { key: 'default_payment_link_template', value: '' },
      { key: 'default_payment_label',         value: 'Assisted Payment' },
      { key: 'default_currency',              value: 'PHP' },
      { key: 'gateway_ai_provider',           value: '' },
      { key: 'gateway_ai_api_key',            value: '' },
      { key: 'gateway_ai_model',              value: '' },
      ];

    for (const { key, value } of defaults) {
      await this.prisma.setting.upsert({
        where: { key },
        update: {}, // Don't overwrite if already exists
        create: { key, value },
      });
    }
  }

  async get(key: string): Promise<string | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) return cached.value;

    const row = await this.prisma.setting.findUnique({ where: { key } });
    const value = row?.value ?? null;
    this.cache.set(key, { value, expiry: Date.now() + CACHE_TTL_MS });
    return value;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where:  { key },
      update: { value },
      create: { key, value },
    });
    // Invalidate cache immediately so next read reflects the new value
    this.cache.delete(key);
  }

  async delete(key: string): Promise<void> {
    await this.prisma.setting.deleteMany({ where: { key } });
    this.cache.delete(key);
  }

  async list(): Promise<Array<{ key: string; value: string; updatedAt: Date }>> {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }
}
