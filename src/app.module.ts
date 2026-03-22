import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { KeysModule } from './keys/keys.module';
import { RegistryModule } from './registry/registry.module';
import { McpModule } from './mcp/mcp.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    KeysModule,
    RegistryModule,
    McpModule,
    MailModule,
  ],
})
export class AppModule {}
