import { Injectable } from '@nestjs/common';

type TelemetryPoint = {
  timestamp: Date;
  vibracao: number;
};

@Injectable()
export class VibrationAnalyticsService {
  average(points: TelemetryPoint[]) {
    if (points.length === 0) return 0;
    return points.reduce((sum, point) => sum + point.vibracao, 0) / points.length;
  }

  failureTrend(points: TelemetryPoint[]) {
    const ordered = points.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const last = ordered.slice(-30);
    const values = last.map((point) => point.vibracao);
    const slope = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
    const avg = this.average(last);

    return {
      slope: Number(slope.toFixed(4)),
      status: slope > 0.08 || avg > 5 ? 'failure-trend' : slope > 0.03 || avg > 3 ? 'attention' : 'stable',
      confidence: Number(Math.min(Math.abs(slope) * 800 + avg * 8, 95).toFixed(1)),
    };
  }

  detectAnomalies(points: TelemetryPoint[]) {
    const avg = this.average(points);
    return points
      .filter((point) => point.vibracao > 6 || point.vibracao > avg * 1.7)
      .map((point) => ({
        type: 'vibration',
        severity: point.vibracao > 6 ? 'critical' : 'warning',
        timestamp: point.timestamp,
        value: point.vibracao,
        message: `Vibracao anormal: ${point.vibracao.toFixed(2)} mm/s`,
      }));
  }
}
