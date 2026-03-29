import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { KeysModule } from './keys/keys.module';
import { RegistryModule } from './registry/registry.module';
import { McpModule } from './mcp/mcp.module';
import { MailModule } from './mail/mail.module';
import { TelegramModule } from './telegram/telegram.module';
import { SettingsModule } from './settings/settings.module';
import { CatalogModule } from './catalog/catalog.module';
import { PaymentModule } from './payments/payment.module';
import { WebhookModule } from './payments/webhook.module';
import { StorefrontModule } from './storefront/storefront.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    KeysModule,
    RegistryModule,
    McpModule,
    MailModule,
    TelegramModule,
    SettingsModule,
    CatalogModule,
    PaymentModule,
    WebhookModule,
    StorefrontModule,
  ],
})
export class AppModule {}
