import { Module } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { RegistrationController, RetailersController, StoresController } from './registry.controller';
import { KeysModule } from '../keys/keys.module';

@Module({
  imports: [KeysModule],
  providers: [RegistryService],
  controllers: [RegistrationController, RetailersController, StoresController],
  exports: [RegistryService],
})
export class RegistryModule {}
