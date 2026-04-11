import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

// SEC-A: Extract JWT from httpOnly cookie first, then fall back to Bearer header
// so existing API clients (curl, Postman) continue to work.
function fromCookieOrHeader(req: Request): string | null {
  const cookie = (req.cookies as Record<string, string>)?.['gw_token'];
  if (cookie) return cookie;
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: fromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not defined'); })(),
      passReqToCallback: false,
    });
  }

  validate(payload: { sub: number; username: string }) {
    return { id: payload.sub, username: payload.username };
  }
}
