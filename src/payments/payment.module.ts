// PaymentModule has NO dependency on TelegramModule — avoids circular deps.
// WebhookController lives in a separate WebhookModule that imports both.
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MockGateway } from './adapters/mock.gateway';
import { PayMongoGateway } from './adapters/paymongo.gateway';
import { StripeGateway } from './adapters/stripe.gateway';
import { PaymentService } from './payment.service';

@Module({
  imports:   [PrismaModule],
  providers: [MockGateway, PayMongoGateway, StripeGateway, PaymentService],
  exports:   [PaymentService],
})
export class PaymentModule {}
