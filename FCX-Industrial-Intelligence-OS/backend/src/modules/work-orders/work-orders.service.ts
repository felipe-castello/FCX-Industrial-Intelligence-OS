import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { pickAllowed } from '../../security/sanitize';

const WORK_ORDER_FIELDS = [
  'numeroOs',
  'companyId',
  'assetId',
  'tecnico',
  'prioridade',
  'status',
  'descricao',
  'dataAbertura',
  'dataFechamento',
];

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string, companyId?: string) {
    return this.prisma.workOrder.findMany({
      where: { ...(status ? { status: status as never } : {}), ...(companyId ? { companyId } : {}) },
      include: { ativo: true },
      orderBy: { dataAbertura: 'desc' },
    });
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({ where: { id }, include: { ativo: true } });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async create(data: Record<string, unknown>) {
    const asset = await this.prisma.asset.findUnique({ where: { id: String(data.assetId || '') } });
    const fields = pickAllowed<Record<string, unknown>>(data, WORK_ORDER_FIELDS);
    return this.prisma.workOrder.create({ data: { ...fields, companyId: data.companyId || asset?.companyId } as never });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    return this.prisma.workOrder.update({ where: { id }, data: pickAllowed(data, WORK_ORDER_FIELDS) as never });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
