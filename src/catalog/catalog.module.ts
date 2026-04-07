import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { KeysModule } from '../keys/keys.module';
import { RegistryModule } from '../registry/registry.module';
import { CatalogFormatter } from './catalog-formatter';

@Module({
  imports: [PrismaModule, KeysModule, RegistryModule],
  providers: [CatalogService, CatalogFormatter],
  controllers: [CatalogController],
  exports: [CatalogService, CatalogFormatter],
})
export class CatalogModule {}
