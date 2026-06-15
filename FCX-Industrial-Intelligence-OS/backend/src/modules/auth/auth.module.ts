import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController, AccessControlController } from './auth.controller';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ secret: config.get<string>('JWT_SECRET') || 'development-only-change-me' }),
    }),
  ],
  controllers: [AuthController, AccessControlController],
  providers: [AuthService, AuditService, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
  exports: [AuthService, AuditService],
})
export class AuthModule {}
