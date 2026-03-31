import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
  Headers, UnauthorizedException, NotFoundException, ParseIntPipe,
  Inject, forwardRef
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KeysService } from '../keys/keys.service';
import { RegistryService } from '../registry/registry.service';
import { TelegramService } from '../telegram/telegram.service';
import { ConversationService } from './conversation.service';

@Controller('api')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly keys: KeysService,
    private readonly registry: RegistryService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegram: TelegramService,
    private readonly conversation: ConversationService,
  ) {}

  // ── Admin Endpoints (JWT Auth) ──────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('chat/conversations')
  async list(
    @Query('store') storeSlug?: string,
    @Query('mode') mode?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const page = parseInt(pageRaw || '1', 10);
    const limit = parseInt(limitRaw || '50', 10);
    return this.chatService.listConversations({ storeSlug, mode, page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/conversations/:id/messages')
  async getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getMessages(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('chat/conversations/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { mode?: 'ai' | 'human' | 'closed'; assignedTo?: string }
  ) {
    if (body.mode) {
      return this.conversation.setMode(id, body.mode, body.assignedTo);
    }
    return this.chatService.updateConversation(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat/conversations/:id/messages')
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { body: string; senderName?: string }
  ) {
    return this.conversation.deliverFromAdmin(id, body.body, body.senderName || 'System Admin');
  }

  // ── Seller Endpoints (Platform Key Auth) ────────────────────────────────

  @Post('stores/:slug/conversations/deliver')
  async deliver(
    @Param('slug') slug: string,
    @Headers('x-gateway-key') platformKey: string,
    @Body() body: { body: string; senderName: string; buyerRef?: string; conversationId?: number }
  ) {
    await this.validateKey(slug, platformKey);

    let conv;
    if (body.conversationId) {
      conv = await this.conversation.findById(body.conversationId);
    } else if (body.buyerRef) {
      conv = await this.conversation.findByBuyerRef(body.buyerRef, slug);
    }

    if (!conv || conv.storeSlug !== slug) {
      throw new NotFoundException('Conversation not found');
    }

    // 2. Deliver message via Telegram
    const prefix = body.senderName ? `[${body.senderName}]: ` : '';
    await this.telegram.sendMessage(conv.buyerRef, `${prefix}${body.body}`);

    // 3. Log message to gateway DB
    await this.conversation.logMessage(conv.id, slug, 'human', body.body, body.senderName);

    return { success: true };
  }

  private async validateKey(slug: string, platformKey: string) {
    if (!platformKey) throw new UnauthorizedException('x-gateway-key header required.');
    const valid = await this.keys.validateKey(platformKey);
    if (!valid || valid.slug !== slug) {
      throw new UnauthorizedException('Invalid or mismatched platform key.');
    }
  }
}
