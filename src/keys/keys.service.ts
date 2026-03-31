import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { PRISMA } from '../prisma/prisma.module';

@Injectable()
export class KeysService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  /** Issue a fresh platform key to a retailer. Revokes any existing key first. */
  async issueKey(retailerId: number): Promise<string> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id: retailerId },
      include: { platformKey: true },
    });
    if (!retailer) throw new NotFoundException(`Retailer ${retailerId} not found.`);

    const key = `gk_${crypto.randomBytes(24).toString('hex')}`;

    await this.prisma.$transaction([
      // Create new key (will overwrite any existing due to 1:1 upsert)
      this.prisma.platformKey.upsert({
        where: { retailerId },
        create: { retailerId, key },
        update: { key, revokedAt: null, issuedAt: new Date() },
      }),
      // Audit
      this.prisma.auditLog.create({
        data: { retailerId, event: 'key_issued' },
      }),
    ]);

    return key;
  }

  /** Revoke a retailer's active platform key. */
  async revokeKey(retailerId: number): Promise<void> {
    const existing = await this.prisma.platformKey.findUnique({
      where: { retailerId },
    });
    if (!existing) throw new NotFoundException('No active key found for this retailer.');

    await this.prisma.$transaction([
      this.prisma.platformKey.update({
        where: { retailerId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.auditLog.create({
        data: { retailerId, event: 'key_revoked' },
      }),
    ]);
  }

  /** Validate an incoming x-gateway-key and return the retailer if active. */
  async validateKey(key: string) {
    const record = await this.prisma.platformKey.findUnique({
      where: { key },
      include: { retailer: true },
    });

    if (!record || record.revokedAt) return null;
    if (!record.retailer.verified || !record.retailer.active) return null;

    return record.retailer;
  }
}
