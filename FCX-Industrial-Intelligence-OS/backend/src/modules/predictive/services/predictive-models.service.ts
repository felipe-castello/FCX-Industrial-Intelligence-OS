import { Injectable } from '@nestjs/common';

type TelemetryPoint = {
  timestamp: Date;
  temperatura: number;
  vibracao: number;
  corrente: number;
  tensao: number;
  potencia: number;
};

@Injectable()
export class PredictiveModelsService {
  regressionForecast(values: number[], horizon = 12) {
    if (values.length === 0) {
      return Array.from({ length: horizon }, () => 0);
    }

    const slope = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
    const base = values.slice(-12).reduce((sum, value) => sum + value, 0) / Math.min(values.length, 12);

    return Array.from({ length: horizon }, (_, index) => Number(Math.max(base + slope * (index + 1), 0).toFixed(2)));
  }

  randomForestFailureRisk(points: TelemetryPoint[], alarmScore: number) {
    const latest = points[0];
    if (!latest) return 0;

    const treeVotes = [
      latest.temperatura > 35 ? 1 : 0,
      latest.vibracao > 5.5 ? 1 : 0,
      latest.corrente > 95 ? 1 : 0,
      latest.potencia > 70 ? 1 : 0,
      alarmScore > 45 ? 1 : 0,
    ];

    return Math.round((treeVotes.reduce((sum, vote) => sum + vote, 0) / treeVotes.length) * 100);
  }

  xgboostFailureRisk(points: TelemetryPoint[], healthScore: number, alarmScore: number) {
    const latest = points[0];
    if (!latest) return Math.max(0, 100 - healthScore);

    const weighted =
      latest.temperatura * 0.9 +
      latest.vibracao * 8 +
      latest.corrente * 0.28 +
      latest.potencia * 0.32 +
      alarmScore * 0.45 +
      (100 - healthScore) * 0.55;

    return Math.round(Math.max(0, Math.min(weighted, 100)));
  }

  isolationForestAnomalyScore(point: TelemetryPoint, baseline: TelemetryPoint[]) {
    if (baseline.length === 0) return 0;

    const metrics: Array<keyof TelemetryPoint> = ['temperatura', 'vibracao', 'corrente', 'potencia'];
    const deviations = metrics.map((metric) => {
      const values = baseline.map((item) => Number(item[metric]));
      const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
      const variance = values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length;
      const std = Math.sqrt(variance) || 1;
      return Math.abs(Number(point[metric]) - avg) / std;
    });

    const score = deviations.reduce((sum, value) => sum + value, 0) / deviations.length;
    return Math.round(Math.min(score * 22, 100));
  }
}
