import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PRISMA } from '../prisma/prisma.module';
import type { PrismaClient } from '@prisma/client';

@Injectable()
export class WhatsAppSessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppSessionService.name);
  private readonly TTL_MINUTES = 30;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  onModuleInit() {
    // Run cleanup every 15 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired().catch(err => this.logger.error('Session cleanup failed', err));
    }, 15 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  /** Get active session, auto-deleted if expired */
  async getSession<T = any>(userId: string, type: string): Promise<T | null> {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await this.deleteSession(userId, type);
      return null;
    }

    // Touch the session to extend its life
    await this.setSession(userId, type, session.data as unknown as T);
    return session.data as unknown as T;
  }

  /** Upsert session with new 30-min expiry */
  async setSession<T = any>(userId: string, type: string, data: T): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.TTL_MINUTES);

    await this.prisma.whatsAppSession.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, data: data as any, expiresAt },
      update: { data: data as any, expiresAt, updatedAt: new Date() },
    });
  }

  async deleteSession(userId: string, type: string): Promise<void> {
    try {
      await this.prisma.whatsAppSession.delete({
        where: { userId_type: { userId, type } },
      });
    } catch {
      // ignore if it doesn't exist
    }
  }

  async clearAllSessions(userId: string): Promise<void> {
    await this.prisma.whatsAppSession.deleteMany({
      where: { userId },
    });
  }

  /** Optional: Clean up expired sessions periodically */
  async cleanupExpired(): Promise<void> {
    const result = await this.prisma.whatsAppSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.debug(`Cleaned up ${result.count} expired WhatsApp sessions`);
    }
  }
}
