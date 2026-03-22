import { Module } from '@nestjs/common';
import { RegistryModule } from '../registry/registry.module';

// The MCP gateway server is mounted directly on Express in main.ts
// after the NestJS app is created, so this module just declares the dependency.
@Module({
  imports: [RegistryModule],
})
export class McpModule {}
