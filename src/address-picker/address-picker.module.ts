import { Module, forwardRef } from '@nestjs/common';
import { AddressPickerService } from './address-picker.service';
import { AddressPickerController } from './address-picker.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { SettingsModule } from '../settings/settings.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [PrismaModule, forwardRef(() => WhatsAppModule), forwardRef(() => TelegramModule), SettingsModule],
  providers: [AddressPickerService],
  controllers: [AddressPickerController],
  exports: [AddressPickerService],
})
export class AddressPickerModule {}
