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
    const count = await this.prisma.adminUser.count();
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME ?? 'admin';
    const password = process.env.ADMIN_PASSWORD;

    if (!password || password === 'admin123' || password === 'password') {
      throw new Error('CRITICAL: ADMIN_PASSWORD is not set or is set to an insecure default. Please set a strong ADMIN_PASSWORD in your .env file.');
    }

    try {
      const hash = await bcrypt.hash(password, 12);
      await this.prisma.adminUser.create({
        data: { username, passwordHash: hash }
      });
      console.log(`✔  Default gateway admin created (${username}).`);
    } catch (error) {
      // If another instance already created the admin, ignore the error
      const countAfter = await this.prisma.adminUser.count();
      if (countAfter === 0) {
        throw error;
      }
      console.log('ℹ  Admin user already exists (likely created by another instance).');
    }
  }
}
