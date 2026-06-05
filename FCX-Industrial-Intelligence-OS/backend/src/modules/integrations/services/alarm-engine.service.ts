import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ProcessedTelemetry } from '../types/integration.types';

@Injectable()
export class AlarmEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluate(telemetry: ProcessedTelemetry) {
    if (!telemetry.assetId) {
      return [];
    }

    const alarms = [
      telemetry.temperatura > 35
        ? {
            severidade: 'CRITICAL',
            titulo: 'Temperatura critica',
            descricao: `Temperatura em ${telemetry.temperatura} C recebida via ${telemetry.source}.`,
          }
        : null,
      telemetry.vibracao > 6
        ? {
            severidade: 'CRITICAL',
            titulo: 'Vibracao critica',
            descricao: `Vibracao em ${telemetry.vibracao} mm/s recebida via ${telemetry.source}.`,
          }
        : null,
      telemetry.corrente > 100
        ? {
            severidade: 'WARNING',
            titulo: 'Corrente elevada',
            descricao: `Corrente em ${telemetry.corrente} A recebida via ${telemetry.source}.`,
          }
        : null,
    ].filter(Boolean) as Array<{ severidade: 'WARNING' | 'CRITICAL'; titulo: string; descricao: string }>;

    if (alarms.length === 0) {
      return [];
    }

    await this.prisma.asset.update({
      where: { id: telemetry.assetId },
      data: { status: 'ALARM' },
    });

    return Promise.all(
      alarms.map((alarm) =>
        this.prisma.alarm.create({
          data: {
            assetId: telemetry.assetId as string,
            severidade: alarm.severidade,
            titulo: alarm.titulo,
            descricao: alarm.descricao,
            timestamp: telemetry.timestamp,
            status: 'ACTIVE',
          },
        }),
      ),
    );
  }
}
