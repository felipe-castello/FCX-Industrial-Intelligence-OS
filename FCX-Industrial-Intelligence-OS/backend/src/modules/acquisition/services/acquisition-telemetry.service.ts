import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AcquisitionAlarmService } from './acquisition-alarm.service';
import { AcquisitionAssetService } from './acquisition-asset.service';
import { AcquisitionPayload, AcquisitionProtocol, NormalizedAcquisitionTelemetry } from '../types/acquisition.types';

@Injectable()
export class AcquisitionTelemetryService {
  private readonly logger = new Logger(AcquisitionTelemetryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assets: AcquisitionAssetService,
    private readonly alarms: AcquisitionAlarmService,
  ) {}

  async ingestRaw(source: string, protocol: AcquisitionProtocol, payload: AcquisitionPayload, topic?: string) {
    const assetId = await this.assets.resolveAssetId(payload.assetId, payload.externalId);
    const raw = await this.prisma.telemetryRaw.create({
      data: {
        assetId,
        source,
        protocol,
        topic,
        payload: payload as never,
      },
    });

    if (!assetId) {
      this.logger.warn(`Raw telemetry stored without asset match. source=${source} topic=${topic || '-'}`);
      return { accepted: false, raw, reason: 'asset not found' };
    }

    const normalized = this.normalize(assetId, payload);
    const processed = await this.prisma.telemetryProcessed.create({
      data: {
        rawId: raw.id,
        assetId,
        source,
        timestamp: normalized.timestamp,
        temperatura: normalized.temperatura,
        vibracao: normalized.vibracao,
        corrente: normalized.corrente,
        tensao: normalized.tensao,
        potencia: normalized.potencia,
        pressao: normalized.pressao,
        pressaoSuccao: normalized.pressaoSuccao,
        pressaoDescarga: normalized.pressaoDescarga,
        umidade: normalized.umidade,
        quality: 'GOOD',
      },
    });

    const alarmEvents = await this.alarms.evaluate(source, normalized);
    return { accepted: true, raw, processed, alarmEvents };
  }

  normalize(assetId: string, payload: AcquisitionPayload): NormalizedAcquisitionTelemetry {
    const corrente = this.number(payload.corrente ?? payload.current);
    const tensao = this.number(payload.tensao ?? payload.voltage);
    const potencia = this.number(payload.potencia ?? payload.power ?? payload.energia) ?? this.estimatePower(corrente, tensao);

    return {
      assetId,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      temperatura: this.number(payload.temperatura ?? payload.temperature),
      vibracao: this.number(payload.vibracao ?? payload.vibration),
      corrente,
      tensao,
      potencia,
      pressao: this.number(payload.pressao ?? payload.pressure),
      pressaoSuccao: this.number(payload.pressaoSuccao ?? payload.pressao_succao),
      pressaoDescarga: this.number(payload.pressaoDescarga ?? payload.pressao_descarga),
      umidade: this.number(payload.umidade ?? payload.humidity),
    };
  }

  private number(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private estimatePower(corrente?: number, tensao?: number) {
    if (typeof corrente !== 'number' || typeof tensao !== 'number') return undefined;
    return Number(((corrente * tensao * 1.73 * 0.85) / 1000).toFixed(2));
  }
}
