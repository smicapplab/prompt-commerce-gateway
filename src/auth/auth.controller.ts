import {
  Controller, Post, Get, Body, Req, Res,
  HttpCode, HttpStatus, UseGuards, UnauthorizedException,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

// ── SEC-B: In-memory login rate limiter ───────────────────────────────────────
// 10 attempts per IP per 15-minute window.
interface RateLimitEntry { count: number; resetAt: number }
const loginAttempts = new Map<string, RateLimitEntry>();
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Prune stale entries every 30 minutes to prevent unbounded growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(key);
  }
}, 30 * 60 * 1000).unref();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false; // not limited
  }
  entry.count++;
  return entry.count > LOGIN_LIMIT;
}

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
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/login — issues JWT as httpOnly cookie + body for backward compat */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // SEC-B: Rate-limit login attempts per IP
    const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown');
    if (checkLoginRateLimit(ip)) {
      throw new UnauthorizedException('Too many login attempts. Try again in 15 minutes.');
    }

    const result = await this.authService.login(dto.username, dto.password);

    // SEC-A: Set JWT as httpOnly cookie so it cannot be read by JavaScript
    res.cookie(COOKIE_NAME, result.access_token, setCookieOptions());

    // Also return the token in the body for backward compat with API clients
    return result;
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
