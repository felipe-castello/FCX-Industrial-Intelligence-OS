import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NormalizedAcquisitionTelemetry } from '../types/acquisition.types';

@Injectable()
export class AcquisitionAlarmService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluate(source: string, telemetry: NormalizedAcquisitionTelemetry) {
    const rules = [
      { metric: 'temperatura', value: telemetry.temperatura, threshold: 35, severity: 'CRITICAL', title: 'Temperatura critica' },
      { metric: 'vibracao', value: telemetry.vibracao, threshold: 6, severity: 'CRITICAL', title: 'Vibracao critica' },
      { metric: 'corrente', value: telemetry.corrente, threshold: 100, severity: 'WARNING', title: 'Corrente elevada' },
      { metric: 'potencia', value: telemetry.potencia, threshold: 75, severity: 'WARNING', title: 'Potencia elevada' },
      { metric: 'pressao', value: telemetry.pressao, threshold: 22, severity: 'WARNING', title: 'Pressao elevada' },
      { metric: 'umidade', value: telemetry.umidade, threshold: 85, severity: 'WARNING', title: 'Umidade elevada' },
    ];

    const events = rules.filter((rule) => typeof rule.value === 'number' && rule.value > rule.threshold);

    if (events.length === 0) return [];

    await this.prisma.asset.update({
      where: { id: telemetry.assetId },
      data: { status: 'ALARM' },
    });

    return Promise.all(
      events.map((event) =>
        this.prisma.alarmEvent.create({
          data: {
            assetId: telemetry.assetId,
            source,
            severidade: event.severity,
            titulo: event.title,
            descricao: `${event.metric}=${event.value} acima do limite ${event.threshold}`,
            metric: event.metric,
            value: event.value,
            threshold: event.threshold,
            timestamp: telemetry.timestamp,
          },
        }),
      ),
    );
  }
}
