import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import fs from 'fs';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { RegistryService } from './registry/registry.service';
import express from 'express';
import { mountGatewayMcp } from './mcp/gateway-server';
import { ensureEnvSetup } from './auth/env-setup';

async function bootstrap(): Promise<void> {
  // ── Environment Setup ──────────────────────────────────────────────────────
  ensureEnvSetup();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
    bodyParser: false,
  });

  // ── CORS ───────────────────────────────────────────────────────────────────
  // SEC-6: Restrict CORS to trusted origins
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3002', 'https://your-seller-domain.com'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });

  // ── Body parsing (Custom) ──────────────────────────────────────────────────
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  // Apply JSON parsing selectively:
  //   /webhooks/*  → preserve raw body for signature verification (HMAC)
  //   /api/*       → standard JSON parsing
  //   everything else → no body parsing (MCP SSE streams, etc.)
  expressApp.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/webhooks/') || req.path.startsWith('/whatsapp/')) {
      // Capture raw body AND parse JSON; raw body needed for HMAC signature check
      express.json({
        limit: '1mb',
        verify: (reqInner: any, _res: any, buf: Buffer) => {
          reqInner.rawBody = buf;
        },
      })(req, res, next);
    } else if (req.path.startsWith('/api')) {
      express.json({ limit: '10mb' })(req, res, next);
    } else {
      next();
    }
  });

  // ── Static files (SvelteKit UI) ────────────────────────────────────────────
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
  if (fs.existsSync(frontendBuildPath)) {
    app.useStaticAssets(frontendBuildPath);
    // SPA fallback: serve index.html for any non-API, non-SSE, non-webhook route
    expressApp.use((req: any, res: any, next: any) => {
      if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/sse') ||
        req.path.startsWith('/webhooks') ||
        req.path.startsWith('/whatsapp') ||
        req.path.startsWith('/payment') ||
        req.path.startsWith('/mock-pay') ||
        req.path.includes('.')
      ) {
        return next();
      }
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }

  // ── Seed default admin ─────────────────────────────────────────────────────
  const authService = app.get(AuthService);
  await authService.seedAdmin();

  // ── Mount MCP gateway on the same Express instance ─────────────────────────
  // The MCP SSE endpoint lives at /sse (alongside NestJS API routes at /api/*)
  const registryService = app.get(RegistryService);
  mountGatewayMcp(expressApp, registryService);

  // ── Start ──────────────────────────────────────────────────────────────────
  // Render injects PORT at runtime; fall back to GATEWAY_PORT for local dev
  const port = parseInt(process.env.PORT ?? process.env.GATEWAY_PORT ?? '3002', 10);
  await app.listen(port);
  console.log(`\n Prompt Commerce Gateway`);
  console.log(`   MCP SSE   : http://localhost:${port}/sse`);
  console.log(`   Admin API : http://localhost:${port}/api`);
  console.log(`   Admin UI  : http://localhost:${port}`);
  console.log('');
  console.log(`   Claude Desktop config:`);
  console.log(`   {`);
  console.log(`     "mcpServers": {`);
  console.log(`       "prompt-commerce": {`);
  console.log(`         "url": "http://localhost:${port}/sse"`);
  console.log(`       }`);
  console.log(`     }`);
  console.log(`   }`);
  console.log('');
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to start gateway:', err);
  process.exit(1);
});
