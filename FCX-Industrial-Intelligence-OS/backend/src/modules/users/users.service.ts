import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { pickAllowed } from '../../security/sanitize';
import * as bcrypt from 'bcrypt';

const USER_FIELDS = ['companyId', 'nome', 'email', 'role', 'status'];
const USER_SELECT = { id: true, companyId: true, nome: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true } as const;

const userData = (data: Record<string, unknown>) => {
  const allowed = pickAllowed<Record<string, unknown>>(data, USER_FIELDS);

  if (allowed.role !== undefined) {
    const role = String(allowed.role).toUpperCase();

    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(`Invalid user role: ${allowed.role}`);
    }

    allowed.role = role as UserRole;
  }

  return allowed;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId?: string) {
    return this.prisma.user.findMany({ where: companyId ? { companyId } : undefined, orderBy: { createdAt: 'desc' }, select: USER_SELECT });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: Record<string, unknown>) {
    const passwordHash = data.password ? await bcrypt.hash(String(data.password), Number(process.env.BCRYPT_ROUNDS || 12)) : undefined;
    return this.prisma.user.create({ data: { ...userData(data), ...(passwordHash ? { passwordHash } : {}) } as never, select: USER_SELECT });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    const passwordHash = data.password ? await bcrypt.hash(String(data.password), Number(process.env.BCRYPT_ROUNDS || 12)) : undefined;
    return this.prisma.user.update({ where: { id }, data: { ...userData(data), ...(passwordHash ? { passwordHash } : {}) } as never, select: USER_SELECT });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
