import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(data: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    method?: string;
    path?: string;
    ipAddress?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.auditLog.create({ data: data as never });
  }

  list(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 500),
      include: { user: { select: { id: true, nome: true, email: true, role: true } } },
    });
  }
}
