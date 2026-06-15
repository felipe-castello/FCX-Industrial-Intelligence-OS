import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(filters: { companyId?: string; clientId?: string; siteId?: string; assetId?: string; deviceId?: string } = {}) {
    const optionalAnd = (conditions: Record<string, unknown>[]) => conditions.length ? { AND: conditions } : {};
    const assetWhere = optionalAnd([
      ...(filters.companyId ? [{ companyId: filters.companyId }] : []),
      ...(filters.clientId ? [{ site: { clientId: filters.clientId } }] : []),
      ...(filters.siteId ? [{ siteId: filters.siteId }] : []),
      ...(filters.assetId ? [{ id: filters.assetId }] : []),
      ...(filters.deviceId ? [{ devices: { some: { id: filters.deviceId } } }] : []),
    ]);
    const telemetryWhere = optionalAnd([
      ...(filters.companyId ? [{ companyId: filters.companyId }] : []),
      ...(filters.clientId ? [{ asset: { site: { clientId: filters.clientId } } }] : []),
      ...(filters.siteId ? [{ asset: { siteId: filters.siteId } }] : []),
      ...(filters.assetId ? [{ assetId: filters.assetId }] : []),
      ...(filters.deviceId ? [{ asset: { devices: { some: { id: filters.deviceId } } } }] : []),
    ]);
    const eventWhere = optionalAnd([
      ...(filters.companyId ? [{ companyId: filters.companyId }] : []),
      ...(filters.clientId ? [{ asset: { site: { clientId: filters.clientId } } }] : []),
      ...(filters.siteId ? [{ asset: { siteId: filters.siteId } }] : []),
      ...(filters.assetId ? [{ assetId: filters.assetId }] : []),
      ...(filters.deviceId ? [{ asset: { devices: { some: { id: filters.deviceId } } } }] : []),
    ]);
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
      this.prisma.asset.count({ where: assetWhere }),
      this.prisma.alarm.count({ where: { ...eventWhere, status: 'ACTIVE' } }),
      this.prisma.workOrder.count({ where: { ...eventWhere, status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS'] } } }),
      this.prisma.telemetry.aggregate({
        where: telemetryWhere,
        _avg: {
          temperatura: true,
          vibracao: true,
          potencia: true,
        },
      }),
      this.prisma.telemetry.findMany({
        where: telemetryWhere,
        orderBy: { timestamp: 'desc' },
        take: 120,
        include: { asset: true },
      }),
      this.prisma.alarm.findMany({
        where: { ...eventWhere, status: 'ACTIVE', severidade: 'CRITICAL' },
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { asset: true },
      }),
      this.prisma.asset.findMany({
        where: { ...assetWhere, criticidade: { in: ['HIGH', 'CRITICAL'] } },
        orderBy: [{ criticidade: 'desc' }, { createdAt: 'desc' }],
        take: 10,
        include: {
          _count: { select: { alarms: true, workOrders: true } },
        },
      }),
      this.prisma.sensor.count({ where: Object.keys(assetWhere).length ? { asset: assetWhere } : undefined }),
      this.prisma.gateway.count({ where: filters.companyId || filters.clientId || filters.siteId ? { site: { ...(filters.companyId ? { companyId: filters.companyId } : {}), ...(filters.clientId ? { clientId: filters.clientId } : {}), ...(filters.siteId ? { id: filters.siteId } : {}) } } : undefined }),
      this.prisma.asset.count({ where: { ...assetWhere, status: 'ONLINE' } }),
      this.prisma.asset.count({ where: { ...assetWhere, status: 'OFFLINE' } }),
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
        saudeAtivos: await this.assetHealth(assetWhere),
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

  private async assetHealth(where: Record<string, unknown>) {
    const grouped = await this.prisma.asset.groupBy({
      by: ['status'],
      where: where as never,
      _count: { status: true },
    });

    return grouped.map((item) => ({
      status: item.status,
      total: item._count.status,
    }));
  }
}
