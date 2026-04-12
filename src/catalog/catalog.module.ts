import { Module, forwardRef } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { KeysModule } from '../keys/keys.module';
import { RegistryModule } from '../registry/registry.module';
import { CatalogFormatter } from './catalog-formatter';
import { TaggingService } from './tagging.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, KeysModule, forwardRef(() => RegistryModule), SettingsModule],
  providers: [CatalogService, CatalogFormatter, TaggingService],
  controllers: [CatalogController],
  exports: [CatalogService, CatalogFormatter, TaggingService],
})
export class CatalogModule {}
