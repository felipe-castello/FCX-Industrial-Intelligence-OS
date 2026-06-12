import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { pickAllowed } from '../../security/sanitize';
import * as bcrypt from 'bcrypt';

const USER_FIELDS = ['companyId', 'roleId', 'nome', 'email', 'role', 'status'];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId?: string) {
    return this.prisma.user.findMany({ where: companyId ? { companyId } : undefined, orderBy: { createdAt: 'desc' }, select: { id: true, companyId: true, roleId: true, nome: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, companyId: true, roleId: true, nome: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: Record<string, unknown>) {
    const passwordHash = data.password ? await bcrypt.hash(String(data.password), Number(process.env.BCRYPT_ROUNDS || 12)) : undefined;
    return this.prisma.user.create({ data: { ...pickAllowed<Record<string, unknown>>(data, USER_FIELDS), ...(passwordHash ? { passwordHash } : {}) } as never, select: { id: true, companyId: true, roleId: true, nome: true, email: true, role: true, status: true, createdAt: true } });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    const passwordHash = data.password ? await bcrypt.hash(String(data.password), Number(process.env.BCRYPT_ROUNDS || 12)) : undefined;
    return this.prisma.user.update({ where: { id }, data: { ...pickAllowed<Record<string, unknown>>(data, USER_FIELDS), ...(passwordHash ? { passwordHash } : {}) } as never, select: { id: true, companyId: true, roleId: true, nome: true, email: true, role: true, status: true, updatedAt: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
