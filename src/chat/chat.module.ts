import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegistryModule } from '../registry/registry.module';
import { KeysModule } from '../keys/keys.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ConversationService } from './conversation.service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    PrismaModule,
    RegistryModule,
    KeysModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [ChatController],
  providers: [ConversationService, ChatService],
  exports: [ConversationService, ChatService],
})
export class ChatModule {}
