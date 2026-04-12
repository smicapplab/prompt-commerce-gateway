import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KeysService } from '../keys/keys.service';
import { IsBoolean, IsOptional } from 'class-validator';
import { RegistryService, RegisterRetailerDto, UpdateRetailerDto, sanitizeRetailer } from './registry.service';
import { TaggingService } from '../catalog/tagging.service';

class UpdateStoreConfigDto {
  @IsOptional()
  @IsBoolean()
  allowsPickup?: boolean;
}

// ── Public registration ────────────────────────────────────────────────────────

@Controller('api/register')
export class RegistrationController {
  constructor(private readonly registry: RegistryService) { }

  /**
   * POST /api/register
   * Public endpoint — retailers submit their details + business permit.
   * Creates an unverified retailer record. Admin must verify manually.
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('businessPermit', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? './uploads',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `permit_${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const ALLOWED_MIME = new Set([
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'application/pdf',
        ]);
        if (ALLOWED_MIME.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(
            `Invalid file type "${file.mimetype}". Only JPEG, PNG, WebP, GIF, or PDF are accepted.`
          ), false);
        }
      },
    }),
  )
  async register(
    @Body() body: RegisterRetailerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const dto: RegisterRetailerDto = {
      ...body,
      businessPermitUrl: file ? file.path : undefined,
    };
    const retailer = await this.registry.register(dto);
    return {
      message: 'Registration submitted. You will receive your platform key by email once verified.',
      id: retailer.id,
      slug: retailer.slug,
    };
  }
}

// ── Public store lookup ────────────────────────────────────────────────────────

@Controller('api/stores')
export class StoresController {
  constructor(
    private readonly keysService: KeysService,
    private readonly registry: RegistryService,
  ) { }

  /**
   * PATCH /api/stores/:slug/store-config
   * Pushed from seller admin (fire-and-forget).
   * Validates platform key via x-gateway-key header.
   */
  @Patch(':slug/store-config')
  async updateStoreConfig(
    @Param('slug') slug: string,
    @Body() body: UpdateStoreConfigDto,
    @Headers('x-gateway-key') platformKey: string,
  ) {
    if (!platformKey) throw new UnauthorizedException('x-gateway-key header required.');

    const retailer = await this.keysService.validateKey(platformKey);
    if (!retailer || retailer.slug !== slug) {
      throw new UnauthorizedException('Invalid platform key for this store.');
    }

    await this.registry.updateBySlug(slug, {
      allowsPickup: body.allowsPickup,
    });

    return { success: true };
  }

  /**
   * GET /api/stores/lookup?key=<platform_key>
   * Public endpoint — validates a platform key and returns the store's
   * public details (slug, name, mcpServerUrl). Used by the seller admin
   * UI to auto-fill the "Add Store" form without manual slug entry.
   *
   * Returns 400 if no key provided, 404 if key is invalid/revoked/inactive.
   */
  @Get('lookup')
  async lookupByKey(@Query('key') key: string) {
    if (!key?.trim()) {
      throw new BadRequestException('key query parameter is required.');
    }

    const retailer = await this.keysService.validateKey(key.trim());
    if (!retailer) {
      throw new NotFoundException('No active store found for this key.');
    }

    return {
      slug: retailer.slug,
      name: retailer.name,
      mcpServerUrl: retailer.mcpServerUrl,
    };
  }
}

// ── Admin registry management ─────────────────────────────────────────────────

@UseGuards(JwtAuthGuard)
@Controller('api/retailers')
export class RetailersController {
  constructor(
    private readonly registry: RegistryService,
    private readonly tagging: TaggingService,
  ) { }

  /** GET /api/retailers */
  @Get()
  async findAll() {
    const retailers = await this.registry.findAll();
    return retailers.map(sanitizeRetailer);
  }

  /** GET /api/retailers/:id */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const retailer = await this.registry.findById(id);
    return sanitizeRetailer(retailer);
  }

  @Get(':id/audit-logs')
  async getAuditLogs(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.registry.getAuditLogs(id, limit);
  }

  /** PATCH /api/retailers/:id — verify, update URL, toggle active, etc. */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRetailerDto,
  ) {
    const retailer = await this.registry.update(id, dto);
    return sanitizeRetailer(retailer);
  }

  /** DELETE /api/retailers/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registry.remove(id);
  }

  /** POST /api/retailers/:id/keys/issue — issue or rotate platform key */
  @Post(':id/keys/issue')
  async issueKey(@Param('id', ParseIntPipe) id: number) {
    const key = await this.registry.issueKey(id);
    return {
      message: 'Platform key issued and emailed to retailer.',
      platform_key: key,
    };
  }

  /** DELETE /api/retailers/:id/keys — revoke active key */
  @Delete(':id/keys')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeKey(@Param('id', ParseIntPipe) id: number) {
    return this.registry.revokeKey(id);
  }

  /**
   * POST /api/retailers/:id/catalog/backfill-ai-tags
   * Admin-only. Queues AI tag generation for all untagged products in this retailer's store.
   * Returns immediately; tagging runs in background.
   */
  @Post(':id/catalog/backfill-ai-tags')
  async backfillAiTags(@Param('id', ParseIntPipe) id: number) {
    const retailer = await this.registry.findById(id);
    const result = await this.tagging.backfill(retailer.slug);
    return {
      message: `AI tag backfill queued for "${retailer.slug}".`,
      queued: result.queued,
    };
  }
}
