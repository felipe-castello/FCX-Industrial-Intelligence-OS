import { Injectable } from '@nestjs/common';

type HealthInput = {
  avgTemperature: number;
  avgVibration: number;
  avgEnergy: number;
  alarmCorrelationScore: number;
  status: string;
  criticality: string;
  failureTrendStatus: string;
};

@Injectable()
export class AssetHealthScoreService {
  calculate(input: HealthInput) {
    const temperaturePenalty = Math.max(input.avgTemperature - 24, 0) * 1.2;
    const vibrationPenalty = Math.max(input.avgVibration - 2, 0) * 7;
    const energyPenalty = Math.max(input.avgEnergy - 45, 0) * 0.35;
    const alarmPenalty = input.alarmCorrelationScore * 0.35;
    const statusPenalty = input.status === 'ALARM' ? 18 : input.status === 'OFFLINE' ? 12 : input.status === 'MAINTENANCE' ? 8 : 0;
    const criticalityPenalty = input.criticality === 'CRITICAL' ? 8 : input.criticality === 'HIGH' ? 4 : 0;
    const trendPenalty = input.failureTrendStatus === 'failure-trend' ? 16 : input.failureTrendStatus === 'attention' ? 8 : 0;

    const score = 100 - temperaturePenalty - vibrationPenalty - energyPenalty - alarmPenalty - statusPenalty - criticalityPenalty - trendPenalty;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  classify(score: number) {
    if (score < 40) return 'critical';
    if (score < 65) return 'attention';
    if (score < 82) return 'monitored';
    return 'healthy';
  }
}
