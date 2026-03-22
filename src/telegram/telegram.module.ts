import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { AiChatService } from './ai-chat.service';
import { RegistryModule } from '../registry/registry.module';
import { SettingsModule } from '../settings/settings.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [RegistryModule, SettingsModule, CatalogModule],
  providers: [TelegramService, AiChatService],
})
export class TelegramModule {}
