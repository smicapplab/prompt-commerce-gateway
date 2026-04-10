import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';

@Injectable()
export class TelegramSessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramSessionService.name);
  private readonly TTL_MINUTES = 60 * 24; // Telegram sessions last 24h by default
  private cleanupTimer?: NodeJS.Timeout;

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  onModuleInit() {
    // Run cleanup every hour
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired().catch(err => this.logger.error('Session cleanup failed', err));
    }, 60 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  /** Get active session, auto-deleted if expired */
  async getSession<T = any>(userId: string, type: string): Promise<T | null> {
    const session = await this.prisma.telegramSession.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await this.deleteSession(userId, type);
      return null;
    }

    // Touch only if close to expiry (within 5 mins) to reduce DB writes
    const fiveMinutes = 5 * 60 * 1000;
    if (session.expiresAt.getTime() - Date.now() < fiveMinutes) {
      await this.setSession(userId, type, session.data as unknown as T);
    }

    return session.data as unknown as T;
  }

  /** Upsert session with new expiry */
  async setSession<T = any>(userId: string, type: string, data: T, ttlMinutes?: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (ttlMinutes || this.TTL_MINUTES));

    await this.prisma.telegramSession.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, data: data as any, expiresAt },
      update: { data: data as any, expiresAt, updatedAt: new Date() },
    });
  }

  async deleteSession(userId: string, type: string): Promise<void> {
    try {
      await this.prisma.telegramSession.delete({
        where: { userId_type: { userId, type } },
      });
    } catch {
      // ignore if it doesn't exist
    }
  }

  async clearAllSessions(userId: string): Promise<void> {
    await this.prisma.telegramSession.deleteMany({
      where: { userId },
    });
  }

  /** Clean up expired sessions periodically */
  async cleanupExpired(): Promise<void> {
    const result = await this.prisma.telegramSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.debug(`Cleaned up ${result.count} expired Telegram sessions`);
    }
  }
}
