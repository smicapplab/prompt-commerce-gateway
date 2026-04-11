import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegistryModule } from '../registry/registry.module';
import { SettingsModule } from '../settings/settings.module';
import { CatalogModule } from '../catalog/catalog.module';
import { TelegramModule } from '../telegram/telegram.module'; // for CartService, AiChatService reuse
import { ChatModule } from '../chat/chat.module';
import { PaymentModule } from '../payments/payment.module';
import { AddressPickerModule } from '../address-picker/address-picker.module';
import { CartModule } from '../cart/cart.module';
import { BotModule } from '../bot/bot.module';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppClient } from './whatsapp-client';
import { WhatsAppSessionService } from './whatsapp-session.service';

@Module({
  imports: [
    PrismaModule,
    RegistryModule,
    SettingsModule,
    CatalogModule,
    forwardRef(() => AddressPickerModule),
    forwardRef(() => TelegramModule),
    forwardRef(() => ChatModule),
    PaymentModule,
    CartModule,
    BotModule,
  ],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppClient,
    WhatsAppSessionService,
    WhatsAppService,
  ],
  exports: [WhatsAppService, WhatsAppClient],
})
export class WhatsAppModule {}
