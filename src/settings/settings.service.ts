import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';

@Injectable()
export class SettingsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async get(key: string): Promise<string | null> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where:  { key },
      update: { value },
      create: { key, value },
    });
  }

  async delete(key: string): Promise<void> {
    await this.prisma.setting.deleteMany({ where: { key } });
  }

  async list(): Promise<Array<{ key: string; value: string; updatedAt: Date }>> {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }
}
