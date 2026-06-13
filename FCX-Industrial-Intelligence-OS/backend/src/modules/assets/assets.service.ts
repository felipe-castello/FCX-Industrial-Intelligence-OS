import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset-management.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { companyId?: string; clientId?: string; siteId?: string; deviceId?: string } = {}) {
    const assets = await this.prisma.asset.findMany({
      where: {
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.siteId ? { siteId: filters.siteId } : {}),
        ...(filters.clientId ? { site: { clientId: filters.clientId } } : {}),
        ...(filters.deviceId ? { devices: { some: { id: filters.deviceId } } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        site: true,
        _count: { select: { telemetry: true, alarms: true, workOrders: true, sensors: true } },
      },
    });

    return assets.map((asset) => this.toApi(asset));
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        telemetry: { orderBy: { timestamp: 'desc' }, take: 20 },
        alarms: { orderBy: { timestamp: 'desc' }, take: 20 },
        workOrders: { orderBy: { dataAbertura: 'desc' }, take: 20 },
        site: true,
        sensors: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.toApi(asset);
  }

  async create(data: CreateAssetDto) {
    const site = data.siteId ? await this.prisma.site.findUnique({ where: { id: data.siteId } }) : null;
    if (data.siteId && !site) throw new NotFoundException('Site not found');
    const asset = await this.prisma.asset.create({
      data: {
        ...this.toDatabase(data),
        ...(site?.companyId ? { companyId: site.companyId } : {}),
        unidade: data.location || site?.name || 'SEM UNIDADE',
      } as never,
      include: { site: true },
    });
    return this.toApi(asset);
  }

  async update(id: string, data: UpdateAssetDto) {
    await this.findOne(id);
    const site = data.siteId ? await this.prisma.site.findUnique({ where: { id: data.siteId } }) : null;
    if (data.siteId && !site) throw new NotFoundException('Site not found');
    const asset = await this.prisma.asset.update({
      where: { id },
      data: { ...this.toDatabase(data), ...(site ? { companyId: site.companyId, unidade: site.name } : {}) } as never,
      include: { site: true },
    });
    return this.toApi(asset);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.asset.delete({ where: { id } });
  }

  private toDatabase(data: CreateAssetDto | UpdateAssetDto) {
    return {
      ...(data.siteId !== undefined ? { siteId: data.siteId } : {}),
      ...(data.name !== undefined ? { nome: data.name } : {}),
      ...(data.type !== undefined ? { tipo: data.type } : {}),
      ...(data.manufacturer !== undefined ? { fabricante: data.manufacturer } : {}),
      ...(data.brand !== undefined ? { brand: data.brand, fabricante: data.brand } : {}),
      ...(data.model !== undefined ? { modelo: data.model } : {}),
      ...(data.serialNumber !== undefined ? { serialNumber: data.serialNumber } : {}),
      ...(data.location !== undefined ? { location: data.location, unidade: data.location } : {}),
      ...(data.criticality !== undefined ? { criticidade: data.criticality } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    };
  }

  private toApi(asset: Record<string, any>) {
    return {
      ...asset,
      name: asset.nome,
      type: asset.tipo,
      manufacturer: asset.fabricante,
      brand: asset.brand || asset.fabricante,
      model: asset.modelo,
      criticality: asset.criticidade,
      location: asset.location || asset.site?.name || asset.unidade,
    };
  }
}
