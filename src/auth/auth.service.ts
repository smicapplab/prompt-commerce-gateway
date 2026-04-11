import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PRISMA } from '../prisma/prisma.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) { }

  async validateAdmin(username: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { username } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? { id: user.id, username: user.username } : null;
  }

  async login(username: string, password: string) {
    const user = await this.validateAdmin(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials.');
    return { access_token: this.jwtService.sign({ sub: user.id, username: user.username }) };
  }

  /** Seed the default admin on first boot if none exists. */
  async seedAdmin(): Promise<void> {
    const username = process.env.ADMIN_USERNAME ?? 'admin';
    const password = process.env.ADMIN_PASSWORD;

    if (!password || password === 'admin123' || password === 'password') {
      throw new Error('CRITICAL: ADMIN_PASSWORD is not set or is set to an insecure default. Please set a strong ADMIN_PASSWORD in your .env file.');
    }

    // Use upsert to avoid race conditions between concurrent instances.
    // If the table is not empty, we could still skip, but upserting based on 
    // username is safer than a separate count() check.
    try {
      const hash = await bcrypt.hash(password, 12);
      await this.prisma.adminUser.upsert({
        where: { username },
        update: {}, // Do nothing if it already exists
        create: {
          username,
          passwordHash: hash,
        },
      });
      console.log(`✔  Default gateway admin verified/created (${username}).`);
    } catch (error) {
      console.error('❌ Failed to seed admin:', error);
      throw error;
    }
  }
}
