import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AlarmEngineService } from './alarm-engine.service';
import { PredictiveEngineService } from './predictive-engine.service';
import { TelemetryProcessingService } from './telemetry-processing.service';
import { IndustrialTelemetryPayload, IntegrationSource } from '../types/integration.types';

@Injectable()
export class DataIngestionService {
  private readonly logger = new Logger(DataIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processing: TelemetryProcessingService,
    private readonly alarmEngine: AlarmEngineService,
    private readonly predictiveEngine: PredictiveEngineService,
  ) {}

  async ingest(source: IntegrationSource, payload: IndustrialTelemetryPayload) {
    const telemetry = this.processing.normalize(source, payload);

    if (!telemetry.assetId) {
      this.logger.warn(`Telemetry from ${source} ignored because assetId is missing.`);
      const prediction = this.predictiveEngine.score(telemetry);
      return { accepted: false, reason: 'assetId missing', telemetry, prediction };
    }

    const asset = await this.prisma.asset.findUnique({ where: { id: telemetry.assetId }, include: { site: true } });
    const stored = await this.prisma.telemetry.create({
      data: {
        assetId: telemetry.assetId,
        companyId: payload.companyId || asset?.companyId,
        clientId: payload.clientId || asset?.site?.clientId,
        siteId: payload.siteId || asset?.siteId,
        deviceId: payload.deviceId,
        timestamp: telemetry.timestamp,
        temperatura: telemetry.temperatura,
        vibracao: telemetry.vibracao,
        corrente: telemetry.corrente,
        tensao: telemetry.tensao,
        potencia: telemetry.potencia,
        pressaoSuccao: telemetry.pressaoSuccao,
        pressaoDescarga: telemetry.pressaoDescarga,
      },
    });

    const alarms = await this.alarmEngine.evaluate(telemetry);
    const prediction = this.predictiveEngine.score(telemetry);
    return { accepted: true, telemetry: stored, alarms, prediction };
  }
}
