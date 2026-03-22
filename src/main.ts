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
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
    bodyParser: false,
  });

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({ origin: true, credentials: true });

  // ── Body parsing (Custom) ──────────────────────────────────────────────────
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  // Apply JSON parsing only to non-MCP routes (like /api/* for admin)
  expressApp.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      express.json({ limit: '10mb' })(req, res, next);
    } else {
      next();
    }
  });

  // ── Static files (admin + registration UI) ─────────────────────────────────
  // Dev: __dirname = src/  → look in src/public (ts-node)
  // Prod: __dirname = dist/ → look in src/public (Dockerfile copies there)
  const publicPath = fs.existsSync(path.join(__dirname, '..', 'src', 'public'))
    ? path.join(__dirname, '..', 'src', 'public')
    : path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicPath)) {
    app.useStaticAssets(publicPath);
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
