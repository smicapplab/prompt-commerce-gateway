import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

export const PRISMA = 'PRISMA' as const;

let _client: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!_client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const pool = new pg.Pool({ connectionString });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaPg(pool as any);
    _client = new PrismaClient({ 
      adapter,
      log: ['warn', 'error'] 
    });
  }
  return _client;
}

@Global()
@Module({
  providers: [
    {
      provide: PRISMA,
      useFactory: () => getPrismaClient(),
    },
  ],
  exports: [PRISMA],
})
export class PrismaModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await _client?.$disconnect();
    _client = null;
  }
}
