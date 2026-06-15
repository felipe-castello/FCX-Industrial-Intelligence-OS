import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { pickAllowed } from '../../security/sanitize';

const TELEMETRY_FIELDS = [
  'assetId',
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

  findAll(assetId?: string, limit = 100) {
    return this.prisma.telemetry.findMany({
      where: assetId ? { assetId } : undefined,
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

  create(data: Record<string, unknown>) {
    return this.prisma.telemetry.create({ data: pickAllowed(data, TELEMETRY_FIELDS) as never });
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
