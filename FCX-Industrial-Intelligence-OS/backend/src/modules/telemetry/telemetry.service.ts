import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MT100_LATEST_TELEMETRY } from '../../demo/mt100.demo';
import { pickAllowed } from '../../security/sanitize';

const TELEMETRY_FIELDS = [
  'assetId',
  'companyId',
  'timestamp',
  'temperatura',
  'vibracao',
  'corrente',
  'tensao',
  'potencia',
  'pressaoSuccao',
  'pressaoDescarga',
];

@Injectable()
export class TelemetryService {
  constructor(private readonly prisma: PrismaService) {}

  latest(companyId?: string) {
    if (companyId && companyId !== '1') return null;
    return { ...MT100_LATEST_TELEMETRY, timestamp: new Date().toISOString() };
  }

  findAll(assetId?: string, limit = 100, companyId?: string) {
    return this.prisma.telemetry.findMany({
      where: { ...(assetId ? { assetId } : {}), ...(companyId ? { companyId } : {}) },
      include: { asset: true },
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 1000),
    });
  }

  async findOne(id: string) {
    const telemetry = await this.prisma.telemetry.findUnique({ where: { id }, include: { asset: true } });

    if (!telemetry) {
      throw new NotFoundException('Telemetry record not found');
    }

    return telemetry;
  }

  async create(data: Record<string, unknown>) {
    const asset = await this.prisma.asset.findUnique({ where: { id: String(data.assetId || '') } });
    const fields = pickAllowed<Record<string, unknown>>(data, TELEMETRY_FIELDS);
    return this.prisma.telemetry.create({ data: { ...fields, companyId: data.companyId || asset?.companyId } as never });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    return this.prisma.telemetry.update({ where: { id }, data: pickAllowed(data, TELEMETRY_FIELDS) as never });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.telemetry.delete({ where: { id } });
  }
}
