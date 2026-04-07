import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { AiChatService } from './ai-chat.service';
import { CartService } from './cart.service';
import { RegistryModule } from '../registry/registry.module';
import { SettingsModule } from '../settings/settings.module';
import { CatalogModule } from '../catalog/catalog.module';
import { PaymentModule } from '../payments/payment.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports:   [RegistryModule, SettingsModule, CatalogModule, PaymentModule, forwardRef(() => ChatModule)],
  providers: [TelegramService, AiChatService, CartService],
  exports:   [TelegramService, CartService, AiChatService],
})
export class TelegramModule {}
