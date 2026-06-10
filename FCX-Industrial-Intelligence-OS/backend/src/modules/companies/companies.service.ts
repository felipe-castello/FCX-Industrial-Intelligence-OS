import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardsService } from '../dashboards/dashboards.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService, private readonly dashboards: DashboardsService) {}

  findAll() {
    return this.prisma.company.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { sites: true, assets: true, users: true } } } });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id }, include: { sites: true, _count: { select: { assets: true, telemetry: true, alarms: true, workOrders: true, users: true } } } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  create(data: CreateCompanyDto) { return this.prisma.company.create({ data: data as never }); }
  async update(id: string, data: UpdateCompanyDto) { await this.findOne(id); return this.prisma.company.update({ where: { id }, data: data as never }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.company.delete({ where: { id } }); }
  async assets(id: string) { await this.findOne(id); return this.prisma.asset.findMany({ where: { companyId: id }, orderBy: { createdAt: 'desc' }, include: { site: true, _count: { select: { sensors: true, telemetry: true, alarms: true, workOrders: true } } } }); }
  async dashboard(id: string) { await this.findOne(id); return this.dashboards.overview(id); }
}
