import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { pickAllowed } from '../../security/sanitize';

const ALARM_FIELDS = ['assetId', 'companyId', 'severidade', 'titulo', 'descricao', 'timestamp', 'status'];

@Injectable()
export class AlarmsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string, companyId?: string) {
    return this.prisma.alarm.findMany({
      where: { ...(status ? { status: status as never } : {}), ...(companyId ? { companyId } : {}) },
      include: { asset: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findOne(id: string) {
    const alarm = await this.prisma.alarm.findUnique({ where: { id }, include: { asset: true } });

    if (!alarm) {
      throw new NotFoundException('Alarm not found');
    }

    return alarm;
  }

  async create(data: Record<string, unknown>) {
    const asset = await this.prisma.asset.findUnique({ where: { id: String(data.assetId || '') } });
    const fields = pickAllowed<Record<string, unknown>>(data, ALARM_FIELDS);
    return this.prisma.alarm.create({ data: { ...fields, companyId: data.companyId || asset?.companyId } as never });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    return this.prisma.alarm.update({ where: { id }, data: pickAllowed(data, ALARM_FIELDS) as never });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.alarm.delete({ where: { id } });
  }
}
