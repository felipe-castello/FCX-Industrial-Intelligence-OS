import { Injectable } from '@nestjs/common';

type TelemetryPoint = {
  timestamp: Date;
  potencia: number;
  corrente: number;
  tensao: number;
};

@Injectable()
export class EnergyAnalyticsService {
  average(points: TelemetryPoint[]) {
    return this.avg(points.map((point) => point.potencia));
  }

  detectAnomalies(points: TelemetryPoint[]) {
    const avg = this.average(points);
    const limit = avg * 1.35;

    return points
      .filter((point) => point.potencia > limit && point.potencia > 0)
      .map((point) => ({
        type: 'energy',
        severity: point.potencia > avg * 1.6 ? 'critical' : 'warning',
        timestamp: point.timestamp,
        value: point.potencia,
        message: `Consumo acima do padrao: ${point.potencia.toFixed(2)} kW`,
      }));
  }

  forecast(points: TelemetryPoint[], horizon = 12) {
    const ordered = points.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const last = ordered.slice(-24);
    const base = this.average(last);
    const slope = this.slope(last.map((point) => point.potencia));
    const start = ordered[ordered.length - 1]?.timestamp || new Date();

    return Array.from({ length: horizon }, (_, index) => ({
      timestamp: new Date(start.getTime() + (index + 1) * 60 * 60 * 1000),
      value: Number(Math.max(base + slope * (index + 1), 0).toFixed(2)),
      unit: 'kW',
    }));
  }

  private avg(values: number[]) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private slope(values: number[]) {
    if (values.length < 2) return 0;
    return (values[values.length - 1] - values[0]) / values.length;
  }
}
