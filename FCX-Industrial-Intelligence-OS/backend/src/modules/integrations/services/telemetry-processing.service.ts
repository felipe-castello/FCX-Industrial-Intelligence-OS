import { Injectable } from '@nestjs/common';
import { IndustrialTelemetryPayload, IntegrationSource, ProcessedTelemetry } from '../types/integration.types';

@Injectable()
export class TelemetryProcessingService {
  normalize(source: IntegrationSource, payload: IndustrialTelemetryPayload): ProcessedTelemetry {
    const corrente = this.number(payload.corrente, 0);
    const tensao = this.number(payload.tensao, 220);
    const potencia = this.number(payload.potencia, this.number(payload.energia, (corrente * tensao * 1.73) / 1000));

    return {
      source,
      assetId: typeof payload.assetId === 'string' ? payload.assetId : undefined,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      temperatura: this.number(payload.temperatura, 0),
      vibracao: this.number(payload.vibracao, 0),
      corrente,
      tensao,
      potencia,
      pressaoSuccao: this.number(payload.pressaoSuccao ?? payload.pressao_succao, 0),
      pressaoDescarga: this.number(payload.pressaoDescarga ?? payload.pressao_descarga, 0),
      raw: payload,
    };
  }

  private number(value: unknown, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
