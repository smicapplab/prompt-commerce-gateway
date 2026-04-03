import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient, Retailer } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { KeysService } from '../keys/keys.service';
import { MailService } from '../mail/mail.service';

export interface RegisterRetailerDto {
  slug: string;
  name: string;
  contactEmail: string;
  mcpServerUrl: string;
  businessPermitUrl?: string;
}

export interface UpdateRetailerDto {
  name?: string;
  contactEmail?: string;
  mcpServerUrl?: string;
  businessPermitUrl?: string;
  verified?: boolean;
  active?: boolean;
  // AI assistant config for the Telegram bot
  aiProvider?:     string | null;
  aiApiKey?:       string | null;
  aiModel?:        string | null;
  aiSystemPrompt?: string | null;
  serperApiKey?:   string | null;
  // Telegram seller notifications
  telegramNotifyChatId?: string | null;
  // Payment gateway config
  paymentProvider?:      string | null;
  paymentApiKey?:        string | null;
  paymentPublicKey?:     string | null;
  paymentWebhookSecret?: string | null;
}

@Injectable()
export class RegistryService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly keysService: KeysService,
    private readonly mailService: MailService,
  ) {}

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

  async getAuditLogs(retailerId: number, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Public registration — creates retailer in unverified state, no key yet. */
  async register(dto: RegisterRetailerDto): Promise<Retailer> {
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
}
