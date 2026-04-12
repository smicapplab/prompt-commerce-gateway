import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
  ) {}

  async listConversations(params: {
    storeSlug?: string;
    mode?: string;
    page?: number;
    limit?: number;
  }) {
    const { storeSlug, mode, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ConversationWhereInput = {};
    if (storeSlug) where.storeSlug = storeSlug;
    if (mode) where.mode = mode as any;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        include: {
          _count: {
            select: { messages: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      conversations: conversations.map(c => ({
        ...c,
        lastMessage: c.messages[0]?.body || null,
        lastMessageAt: c.messages[0]?.createdAt || null,
        messageCount: c._count.messages,
      })),
      total,
      page,
      limit,
    };
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRecentMessages(conversationId: number, limit = 20) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    // Reverse so messages are chronological (oldest first) for AI context / UI display
    return messages.reverse();
  }

  async updateConversation(id: number, data: { mode?: string; assignedTo?: string }) {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }
}
