import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { pickAllowed } from '../../security/sanitize';

const ASSET_FIELDS = ['nome', 'tipo', 'fabricante', 'modelo', 'unidade', 'criticidade', 'status'];

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { telemetry: true, alarms: true, workOrders: true } },
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        telemetry: { orderBy: { timestamp: 'desc' }, take: 20 },
        alarms: { orderBy: { timestamp: 'desc' }, take: 20 },
        workOrders: { orderBy: { dataAbertura: 'desc' }, take: 20 },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.asset.create({ data: pickAllowed(data, ASSET_FIELDS) as never });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    return this.prisma.asset.update({ where: { id }, data: pickAllowed(data, ASSET_FIELDS) as never });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.asset.delete({ where: { id } });
  }
}
