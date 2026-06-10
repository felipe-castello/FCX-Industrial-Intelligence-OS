import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(companyId?: string) {
    const companyWhere = companyId ? { companyId } : {};
    const [
      assetsMonitored,
      activeAlarms,
      openWorkOrders,
      telemetryAgg,
      recentTelemetry,
      criticalAlarms,
      criticalAssets,
      sensorsCount,
      gatewaysCount,
      onlineAssets,
      offlineAssets,
    ] = await Promise.all([
      this.prisma.asset.count({ where: companyWhere }),
      this.prisma.alarm.count({ where: { ...companyWhere, status: 'ACTIVE' } }),
      this.prisma.workOrder.count({ where: { ...companyWhere, status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS'] } } }),
      this.prisma.telemetry.aggregate({
        where: companyWhere,
        _avg: {
          temperatura: true,
          vibracao: true,
          potencia: true,
        },
      }),
      this.prisma.telemetry.findMany({
        where: companyWhere,
        orderBy: { timestamp: 'desc' },
        take: 120,
        include: { asset: true },
      }),
      this.prisma.alarm.findMany({
        where: { ...companyWhere, status: 'ACTIVE', severidade: 'CRITICAL' },
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { asset: true },
      }),
      this.prisma.asset.findMany({
        where: { ...companyWhere, criticidade: { in: ['HIGH', 'CRITICAL'] } },
        orderBy: [{ criticidade: 'desc' }, { createdAt: 'desc' }],
        take: 10,
        include: {
          _count: { select: { alarms: true, workOrders: true } },
        },
      }),
      this.prisma.sensor.count({ where: companyId ? { asset: { companyId } } : undefined }),
      this.prisma.gateway.count({ where: companyId ? { site: { companyId } } : undefined }),
      this.prisma.asset.count({ where: { ...companyWhere, status: 'ONLINE' } }),
      this.prisma.asset.count({ where: { ...companyWhere, status: 'OFFLINE' } }),
    ]);

    const temperatureTrend = recentTelemetry
      .slice()
      .reverse()
      .map((item) => ({
        timestamp: item.timestamp,
        asset: item.asset.nome,
        value: item.temperatura,
      }));

    const vibrationTrend = recentTelemetry
      .slice()
      .reverse()
      .map((item) => ({
        timestamp: item.timestamp,
        asset: item.asset.nome,
        value: item.vibracao,
      }));

    return {
      kpis: {
        ativosMonitorados: assetsMonitored,
        alarmesAtivos: activeAlarms,
        temperaturaMedia: Number((telemetryAgg._avg.temperatura ?? 0).toFixed(2)),
        vibracaoMedia: Number((telemetryAgg._avg.vibracao ?? 0).toFixed(2)),
        consumoEnergetico: Number((telemetryAgg._avg.potencia ?? 0).toFixed(2)),
        ordensAbertas: openWorkOrders,
        assetsCount: assetsMonitored,
        sensorsCount,
        gatewaysCount,
        onlineAssets,
        offlineAssets,
      },
      widgets: {
        saudeAtivos: await this.assetHealth(companyId),
        alarmesCriticos: criticalAlarms,
        tendenciaTemperatura: temperatureTrend,
        tendenciaVibracao: vibrationTrend,
        consumoEnergetico: recentTelemetry.slice(0, 30).map((item) => ({
          timestamp: item.timestamp,
          asset: item.asset.nome,
          value: item.potencia,
        })),
        rankingAtivosCriticos: criticalAssets,
      },
    };
  }

  private async assetHealth(companyId?: string) {
    const grouped = await this.prisma.asset.groupBy({
      by: ['status'],
      where: companyId ? { companyId } : undefined,
      _count: { status: true },
    });

    return grouped.map((item) => ({
      status: item.status,
      total: item._count.status,
    }));
  }
}
