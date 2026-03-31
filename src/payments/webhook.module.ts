// WebhookModule hosts the WebhookController.
// Importing both TelegramModule and PaymentModule here (not in each other)
// avoids a circular dependency.
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { MockPayController } from './mock-pay.controller';
import { PaymentModule } from './payment.module';
import { TelegramModule } from '../telegram/telegram.module';
import { SettingsModule } from '../settings/settings.module';
import { KeysModule } from '../keys/keys.module';

@Module({
  imports:     [PaymentModule, TelegramModule, SettingsModule, KeysModule],
  controllers: [WebhookController, MockPayController],
})
export class WebhookModule {}
