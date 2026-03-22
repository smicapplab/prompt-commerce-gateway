// WebhookModule hosts the WebhookController.
// Importing both TelegramModule and PaymentModule here (not in each other)
// avoids a circular dependency.
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentModule } from './payment.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports:     [PaymentModule, TelegramModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
