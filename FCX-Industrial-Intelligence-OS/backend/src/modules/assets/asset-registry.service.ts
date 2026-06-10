import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AssetRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  sites(companyId?: string) {
    return this.prisma.site.findMany({ where: companyId ? { companyId } : undefined, orderBy: { createdAt: 'desc' }, include: { company: true, _count: { select: { assets: true, gateways: true } } } });
  }

  site(id: string) {
    return this.findOrThrow(this.prisma.site.findUnique({ where: { id }, include: { company: true, assets: true, gateways: true } }), 'Site');
  }

  createSite(data: object) {
    return this.prisma.site.create({ data: data as never });
  }

  async updateSite(id: string, data: object) {
    await this.site(id);
    return this.prisma.site.update({ where: { id }, data: data as never });
  }

  async removeSite(id: string) {
    await this.site(id);
    return this.prisma.site.delete({ where: { id } });
  }

  sensors(companyId?: string) {
    return this.prisma.sensor.findMany({ where: companyId ? { asset: { companyId } } : undefined, orderBy: { createdAt: 'desc' }, include: { asset: true } });
  }

  sensor(id: string) {
    return this.findOrThrow(this.prisma.sensor.findUnique({ where: { id }, include: { asset: true } }), 'Sensor');
  }

  createSensor(data: object) {
    return this.prisma.sensor.create({ data: data as never });
  }

  async updateSensor(id: string, data: object) {
    await this.sensor(id);
    return this.prisma.sensor.update({ where: { id }, data: data as never });
  }

  async removeSensor(id: string) {
    await this.sensor(id);
    return this.prisma.sensor.delete({ where: { id } });
  }

  gateways(companyId?: string) {
    return this.prisma.gateway.findMany({ where: companyId ? { site: { companyId } } : undefined, orderBy: { createdAt: 'desc' }, include: { site: true } });
  }

  gateway(id: string) {
    return this.findOrThrow(this.prisma.gateway.findUnique({ where: { id }, include: { site: true } }), 'Gateway');
  }

  createGateway(data: object) {
    return this.prisma.gateway.create({ data: data as never });
  }

  async updateGateway(id: string, data: object) {
    await this.gateway(id);
    return this.prisma.gateway.update({ where: { id }, data: data as never });
  }

  async removeGateway(id: string) {
    await this.gateway(id);
    return this.prisma.gateway.delete({ where: { id } });
  }

  private async findOrThrow<T>(query: Promise<T | null>, entity: string): Promise<T> {
    const result = await query;
    if (!result) throw new NotFoundException(`${entity} not found`);
    return result;
  }
}
