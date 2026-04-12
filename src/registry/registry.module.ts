import { Module, forwardRef } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { RegistrationController, RetailersController, StoresController } from './registry.controller';
import { KeysModule } from '../keys/keys.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [KeysModule, PrismaModule, MailModule, forwardRef(() => CatalogModule)],
  providers: [RegistryService],
  controllers: [RegistrationController, RetailersController, StoresController],
  exports: [RegistryService],
})
export class RegistryModule {}
