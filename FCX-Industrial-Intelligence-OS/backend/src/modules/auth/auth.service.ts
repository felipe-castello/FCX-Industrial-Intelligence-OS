import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from './audit.service';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  private accessToken(user: Record<string, any>) {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      permissions: user.roleProfile?.permissions?.map((item: any) => item.permission.key) || [],
    }, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as never });
  }

  private async issueTokens(user: Record<string, any>) {
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshDays = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 30);
    await this.prisma.authRefreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshDays * 86400000),
      },
    });
    return { accessToken: this.accessToken(user), refreshToken, tokenType: 'Bearer', expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' };
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { roleProfile: { include: { permissions: { include: { permission: true } } } } },
    });
    if (!user?.passwordHash || user.status !== 'ACTIVE' || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.record({ userId: user.id, action: 'login', resource: 'auth', ipAddress });
    return { user: this.publicUser(user), ...(await this.issueTokens(user)) };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.authRefreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: { include: { roleProfile: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || stored.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.authRefreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string, userId?: string, ipAddress?: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.authRefreshToken.findUnique({ where: { tokenHash } });
    await this.prisma.authRefreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit.record({ userId: userId || stored?.userId, action: 'logout', resource: 'auth', ipAddress });
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { accepted: true };
    const token = randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 3600000) },
    });
    return { accepted: true, ...(process.env.AUTH_EXPOSE_RESET_TOKEN === 'true' ? { resetToken: token } : {}) };
  }

  async resetPassword(token: string, password: string) {
    const stored = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!stored || stored.usedAt || stored.expiresAt <= new Date()) throw new BadRequestException('Invalid or expired reset token');
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
      this.prisma.authRefreshToken.updateMany({ where: { userId: stored.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { success: true };
  }

  private publicUser(user: Record<string, any>) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
