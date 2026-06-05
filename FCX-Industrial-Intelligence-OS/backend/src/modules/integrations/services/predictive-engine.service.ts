import { Injectable } from '@nestjs/common';
import { ProcessedTelemetry } from '../types/integration.types';

@Injectable()
export class PredictiveEngineService {
  score(telemetry: ProcessedTelemetry) {
    const temperatureScore = Math.min(Math.max((telemetry.temperatura - 20) * 2, 0), 40);
    const vibrationScore = Math.min(telemetry.vibracao * 7, 40);
    const currentScore = telemetry.corrente > 80 ? 20 : telemetry.corrente / 4;
    const riskScore = Math.round(Math.min(temperatureScore + vibrationScore + currentScore, 100));

    return {
      riskScore,
      status: riskScore >= 75 ? 'high-risk' : riskScore >= 45 ? 'attention' : 'normal',
      recommendations:
        riskScore >= 75
          ? ['Inspecionar vibracao e temperatura', 'Verificar lubrificacao e carga eletrica']
          : riskScore >= 45
            ? ['Acompanhar tendencia nas proximas leituras']
            : ['Operacao dentro do comportamento esperado'],
    };
  }
}
