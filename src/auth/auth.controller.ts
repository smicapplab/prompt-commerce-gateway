import {
  Controller, Post, Get, Body, Req, Res,
  HttpCode, HttpStatus, UseGuards, UnauthorizedException, Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PRISMA } from '../prisma/prisma.module';
import { PrismaClient } from '@prisma/client';

// ── Cookie config ─────────────────────────────────────────────────────────────
const COOKIE_NAME = 'gw_token';
const COOKIE_TTL_MS = 4 * 60 * 60 * 1000; // 4 h — matches JWT_EXPIRES_IN default

function setCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: COOKIE_TTL_MS,
    path: '/',
  };
}

class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(PRISMA) private readonly prisma: PrismaClient,
  ) { }

  private async checkLoginRateLimit(ip: string): Promise<boolean> {
    const key = `login_rate_limit:${ip}`;
    const limit = 10;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const now = new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const record = await tx.rateLimit.findUnique({ where: { key } });

        if (!record || now > record.resetAt) {
          await tx.rateLimit.upsert({
            where: { key },
            create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
            update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
          });
          return false;
        }

        await tx.$executeRaw`UPDATE rate_limits SET count = count + 1 WHERE key = ${key}`;
        const updated = await tx.rateLimit.findUnique({ where: { key } });
        return (updated?.count ?? 0) > limit;
      });
    } catch {
      return false; // Fail open — don't block logins if DB is down
    }
  }

  /** POST /api/auth/login — issues JWT as httpOnly cookie */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // SEC-B: Rate-limit login attempts per IP
    const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown');
    if (await this.checkLoginRateLimit(ip)) {
      throw new UnauthorizedException('Too many login attempts. Try again in 15 minutes.');
    }

    const result = await this.authService.login(dto.username, dto.password);

    // SEC-A: Set JWT as httpOnly cookie so it cannot be read by JavaScript
    res.cookie(COOKIE_NAME, result.access_token, setCookieOptions());

    return { message: 'Authenticated.' };
  }

  /** POST /api/auth/logout — clears the session cookie */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
  }

  /** GET /api/auth/me — returns the current user; used by the SPA to check session */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { id: number; username: string } }) {
    return { id: req.user.id, username: req.user.username };
  }
}
