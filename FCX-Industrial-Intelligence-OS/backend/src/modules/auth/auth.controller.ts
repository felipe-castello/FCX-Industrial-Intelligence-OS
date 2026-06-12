import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from './dto/auth.dto';
import { PrismaService } from '../../database/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') login(@Body() data: LoginDto, @Ip() ip: string) { return this.auth.login(data.email, data.password, ip); }
  @Post('refresh') refresh(@Body() data: RefreshTokenDto) { return this.auth.refresh(data.refreshToken); }
  @Post('logout') logout(@Body() data: RefreshTokenDto, @Req() request: Record<string, any>, @Ip() ip: string) { return this.auth.logout(data.refreshToken, request.user?.sub, ip); }
  @Post('forgot-password') forgot(@Body() data: ForgotPasswordDto) { return this.auth.forgotPassword(data.email); }
  @Post('reset-password') reset(@Body() data: ResetPasswordDto) { return this.auth.resetPassword(data.token, data.password); }
}

@Controller()
export class AccessControlController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  @Get('roles') roles() { return this.prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: 'asc' } }); }
  @Post('roles') createRole(@Body() data: { name: string; description?: string }) { return this.prisma.role.create({ data }); }
  @Patch('roles/:id') updateRole(@Param('id') id: string, @Body() data: { name?: string; description?: string }) { return this.prisma.role.update({ where: { id }, data }); }
  @Delete('roles/:id') deleteRole(@Param('id') id: string) { return this.prisma.role.delete({ where: { id } }); }
  @Get('permissions') permissions() { return this.prisma.permission.findMany({ orderBy: { key: 'asc' } }); }
  @Post('permissions') createPermission(@Body() data: { key: string; description?: string }) { return this.prisma.permission.create({ data }); }
  @Patch('permissions/:id') updatePermission(@Param('id') id: string, @Body() data: { key?: string; description?: string }) { return this.prisma.permission.update({ where: { id }, data }); }
  @Delete('permissions/:id') deletePermission(@Param('id') id: string) { return this.prisma.permission.delete({ where: { id } }); }
  @Get('audit-logs') auditLogs(@Query('limit') limit?: string) { return this.audit.list(limit ? Number(limit) : 100); }
}
