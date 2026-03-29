import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RegistryModule } from '../registry/registry.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [PrismaModule, RegistryModule, CatalogModule],
  controllers: [StorefrontController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
