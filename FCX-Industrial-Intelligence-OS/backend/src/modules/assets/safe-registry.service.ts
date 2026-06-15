import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClientDto, CreateDeviceDto, UpdateClientDto, UpdateDeviceDto } from './dto/safe-registry.dto';

@Injectable()
export class SafeRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  clients() {
    return this.prisma.client.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { sites: true } } } });
  }

  async client(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id }, include: { sites: true } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  createClient(data: CreateClientDto) { return this.prisma.client.create({ data: data as never }); }
  async updateClient(id: string, data: UpdateClientDto) { await this.client(id); return this.prisma.client.update({ where: { id }, data: data as never }); }
  async removeClient(id: string) { await this.client(id); return this.prisma.client.delete({ where: { id } }); }

  devices(assetId?: string) {
    return this.prisma.device.findMany({ where: assetId ? { assetId } : undefined, orderBy: { createdAt: 'desc' }, include: { asset: true } });
  }

  async device(id: string) {
    const device = await this.prisma.device.findUnique({ where: { id }, include: { asset: true } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  createDevice(data: CreateDeviceDto) { return this.prisma.device.create({ data: data as never }); }
  async updateDevice(id: string, data: UpdateDeviceDto) { await this.device(id); return this.prisma.device.update({ where: { id }, data: data as never }); }
  async removeDevice(id: string) { await this.device(id); return this.prisma.device.delete({ where: { id } }); }
}
