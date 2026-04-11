import { Module, forwardRef } from '@nestjs/common';
import { BrowsingService } from './browsing.service';
import { CheckoutService } from './checkout.service';
import { RegistryModule } from '../registry/registry.module';
import { SettingsModule } from '../settings/settings.module';
import { CatalogModule } from '../catalog/catalog.module';
import { PaymentModule } from '../payments/payment.module';
import { ChatModule } from '../chat/chat.module';
import { AddressPickerModule } from '../address-picker/address-picker.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    RegistryModule,
    SettingsModule,
    CatalogModule,
    PaymentModule,
    CartModule,
    forwardRef(() => AddressPickerModule),
    forwardRef(() => ChatModule),
  ],
  providers: [BrowsingService, CheckoutService],
  exports: [BrowsingService, CheckoutService],
})
export class BotModule {}
