import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import * as crypto from 'crypto';

export interface StructuredAddress {
  streetLine: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

@Injectable()
export class AddressPickerService {
  private readonly logger = new Logger(AddressPickerService.name);

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createPickerToken(channel: 'telegram' | 'whatsapp', userId: string, storeSlug: string): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute TTL

    await this.prisma.addressPickerToken.create({
      data: {
        token,
        channel,
        userId,
        storeSlug,
        expiresAt,
      },
    });

    return token;
  }

  async validateToken(token: string) {
    const row = await this.prisma.addressPickerToken.findUnique({
      where: { token },
    });

    if (!row || row.used || row.expiresAt < new Date()) {
      return null;
    }

    return row;
  }

  /**
   * Atomic operation to mark token as used and return it only if it was valid and unused.
   * Prevents double-submission and replay attacks.
   */
  async consumeToken(token: string) {
    const result = await this.prisma.addressPickerToken.updateMany({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    if (result.count === 0) return null;

    return this.prisma.addressPickerToken.findUnique({
      where: { token },
    });
  }
}
