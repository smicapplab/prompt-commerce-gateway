// PaymentModule has NO dependency on TelegramModule — avoids circular deps.
// WebhookController lives in a separate WebhookModule that imports both.
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { MockGateway } from './adapters/mock.gateway';
import { CodGateway } from './adapters/cod.gateway';
import { AssistedGateway } from './adapters/assisted.gateway';
import { PayMongoGateway } from './adapters/paymongo.gateway';
import { StripeGateway } from './adapters/stripe.gateway';
import { PaymentService } from './payment.service';

@Module({
  imports:   [PrismaModule, SettingsModule],
  providers: [MockGateway, CodGateway, AssistedGateway, PayMongoGateway, StripeGateway, PaymentService],
  exports:   [PaymentService],
})
export class PaymentModule {}
