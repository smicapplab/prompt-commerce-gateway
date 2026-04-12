import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Retailer } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { PRISMA } from '../prisma/prisma.module';
import { KeysService } from '../keys/keys.service';
import { MailService } from '../mail/mail.service';
import { isSsrfSafe } from '../utils/ssrf';

const SECRET_FIELDS = [
  'aiApiKey', 'serperApiKey', 'paymentApiKey', 'paymentWebhookSecret',
  'googleMapsEmbedKey', 'googlePlacesBrowserKey',
] as const;

export function sanitizeRetailer<T extends Record<string, any>>(retailer: T): any {
  const result = { ...retailer };
  for (const field of SECRET_FIELDS) {
    (result as any)[`has${field.charAt(0).toUpperCase()}${field.slice(1)}`] = !!result[field];
    delete result[field];
  }
  if ((result as any).platformKey) {
    (result as any).platformKey = {
      ...(result as any).platformKey,
      key: undefined, // Never expose the raw key
      hasKey: !!(result as any).platformKey.key,
    };
  }
  return result;
}

export class RegisterRetailerDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  contactEmail!: string;

  @IsUrl()
  mcpServerUrl!: string;

  @IsUrl()
  @IsOptional()
  businessPermitUrl?: string;
}

export class UpdateRetailerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsUrl()
  @IsOptional()
  mcpServerUrl?: string;

  @IsUrl()
  @IsOptional()
  businessPermitUrl?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  // AI assistant config for the Telegram bot
  @IsString()
  @IsOptional()
  aiProvider?: string | null;

  @IsString()
  @IsOptional()
  aiApiKey?: string | null;

  @IsString()
  @IsOptional()
  aiModel?: string | null;

  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @IsString()
  @IsOptional()
  aiSystemPrompt?: string | null;

  @IsString()
  @IsOptional()
  serperApiKey?: string | null;

  // Telegram and WhatsApp seller notifications
  @IsString()
  @IsOptional()
  telegramNotifyChatId?: string | null;

  @IsBoolean()
  @IsOptional()
  telegramEnabled?: boolean;

  @IsString()
  @IsOptional()
  whatsappNotifyNumber?: string | null;

  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;

  // Payment gateway config
  @IsString()
  @IsOptional()
  paymentProvider?: string | null;

  @IsString()
  @IsOptional()
  paymentApiKey?: string | null;

  @IsString()
  @IsOptional()
  paymentPublicKey?: string | null;

  @IsString()
  @IsOptional()
  paymentWebhookSecret?: string | null;

  @IsString()
  @IsOptional()
  paymentInstructions?: string | null;

  @IsString()
  @IsOptional()
  paymentLinkTemplate?: string | null;

  @IsString()
  @IsOptional()
  assistedLabel?: string | null;

  @IsBoolean()
  @IsOptional()
  allowsPickup?: boolean;

  @IsBoolean()
  @IsOptional()
  allowCod?: boolean;

  @IsString()
  @IsOptional()
  paymentMethods?: string;

  @IsString()
  @IsOptional()
  googleMapsEmbedKey?: string | null;

  @IsString()
  @IsOptional()
  googlePlacesBrowserKey?: string | null;

  @IsString()
  @IsOptional()
  publicUrl?: string | null;
}

@Injectable()
export class RegistryService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly keysService: KeysService,
    private readonly mailService: MailService,
  ) { }

  async findAll() {
    return this.prisma.retailer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { platformKey: true },
    });
  }

  async findBySlug(slug: string) {
    const retailer = await this.prisma.retailer.findUnique({
      where: { slug },
      include: { platformKey: true },
    });
    if (!retailer) throw new NotFoundException(`Retailer with slug "${slug}" not found.`);
    return retailer;
  }

  async findById(id: number) {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id },
      include: { platformKey: true },
    });
    if (!retailer) throw new NotFoundException(`Retailer with ID ${id} not found.`);
    return retailer;
  }

  async getAuditLogs(retailerId: number, limit?: number) {
    const safeTake = Math.min(limit ?? 50, 200);
    return this.prisma.auditLog.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' },
      take: safeTake,
    });
  }

  async addAuditLog(retailerId: number, event: string, meta?: any) {
    return this.prisma.auditLog.create({
      data: {
        retailerId,
        event,
        meta: meta ? structuredClone(meta) : undefined,
      },
    });
  }

  /** Public registration — creates retailer in unverified state, no key yet. */
  async register(dto: RegisterRetailerDto): Promise<Retailer> {
    if (!(await isSsrfSafe(dto.mcpServerUrl))) {
      throw new BadRequestException(`Insecure MCP Server URL: ${dto.mcpServerUrl}`);
    }

    const existingSlug = await this.prisma.retailer.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) throw new ConflictException(`Slug "${dto.slug}" is already taken.`);

    const existingName = await this.prisma.retailer.findUnique({
      where: { name: dto.name },
    });
    if (existingName) throw new ConflictException(`Store name "${dto.name}" is already taken.`);

    const retailer = await this.prisma.retailer.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        contactEmail: dto.contactEmail,
        mcpServerUrl: dto.mcpServerUrl,
        businessPermitUrl: dto.businessPermitUrl ?? null,
        verified: false,
      },
    });

    // Send "Registration Received" email
    await this.mailService.sendRegistrationReceived(retailer.contactEmail, retailer.name);

    return retailer;
  }

  /** Admin: update retailer details or verification status. */
  async update(id: number, dto: UpdateRetailerDto) {
    const existingRetailer = await this.findById(id);

    if (dto.mcpServerUrl && !(await isSsrfSafe(dto.mcpServerUrl))) {
      throw new BadRequestException(`Insecure MCP Server URL: ${dto.mcpServerUrl}`);
    }

    // Auto-issue a key when admin verifies the retailer for the first time
    const becomesVerified = dto.verified === true && !existingRetailer.verified;

    const retailer = await this.prisma.retailer.update({
      where: { id },
      data: dto,
    });

    if (becomesVerified) {
      const existingKey = await this.prisma.platformKey.findUnique({
        where: { retailerId: id },
      });
      if (!existingKey) {
        await this.issueKey(id);
        await this.prisma.auditLog.create({
          data: { retailerId: id, event: 'verified' },
        });
      }
    }

    return retailer;
  }

  /** Issue or rotate platform key and email it to the retailer. */
  async issueKey(id: number): Promise<string> {
    const retailer = await this.findById(id);
    const key = await this.keysService.issueKey(id);

    // Send the key via email
    await this.mailService.sendPlatformKey(retailer.contactEmail, retailer.name, key);

    return key;
  }


  /** Revoke a retailer's active platform key. */
  async revokeKey(id: number): Promise<void> {
    await this.keysService.revokeKey(id);
  }

  /** Admin: delete a retailer and all their data. */
  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.prisma.retailer.delete({ where: { id } });
  }

  /** Returns only verified+active retailers with active keys — used by MCP layer. */
  async findActiveRetailers() {
    return this.prisma.retailer.findMany({
      where: { verified: true, active: true },
      include: { platformKey: true },
    });
  }

  async updateBySlug(slug: string, dto: UpdateRetailerDto) {
    // Validate existence — throws NotFoundException if not found
    await this.findBySlug(slug);

    if (dto.mcpServerUrl && !(await isSsrfSafe(dto.mcpServerUrl))) {
      throw new BadRequestException(`Insecure MCP Server URL: ${dto.mcpServerUrl}`);
    }

    return this.prisma.retailer.update({
      where: { slug },
      data: dto,
    });
  }
}
