import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
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
      this.prisma.asset.count(),
      this.prisma.alarm.count({ where: { status: 'ACTIVE' } }),
      this.prisma.workOrder.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS'] } } }),
      this.prisma.telemetry.aggregate({
        _avg: {
          temperatura: true,
          vibracao: true,
          potencia: true,
        },
      }),
      this.prisma.telemetry.findMany({
        orderBy: { timestamp: 'desc' },
        take: 120,
        include: { asset: true },
      }),
      this.prisma.alarm.findMany({
        where: { status: 'ACTIVE', severidade: 'CRITICAL' },
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { asset: true },
      }),
      this.prisma.asset.findMany({
        where: { criticidade: { in: ['HIGH', 'CRITICAL'] } },
        orderBy: [{ criticidade: 'desc' }, { createdAt: 'desc' }],
        take: 10,
        include: {
          _count: { select: { alarms: true, workOrders: true } },
        },
      }),
      this.prisma.sensor.count(),
      this.prisma.gateway.count(),
      this.prisma.asset.count({ where: { status: 'ONLINE' } }),
      this.prisma.asset.count({ where: { status: 'OFFLINE' } }),
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
        saudeAtivos: await this.assetHealth(),
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

  private async assetHealth() {
    const grouped = await this.prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return grouped.map((item) => ({
      status: item.status,
      total: item._count.status,
    }));
  }
}
