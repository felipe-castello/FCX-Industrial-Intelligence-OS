import { Injectable } from '@nestjs/common';

type TelemetryPoint = {
  timestamp: Date;
  temperatura: number;
};

@Injectable()
export class TemperatureAnalyticsService {
  average(points: TelemetryPoint[]) {
    if (points.length === 0) return 0;
    return points.reduce((sum, point) => sum + point.temperatura, 0) / points.length;
  }

  detectAnomalies(points: TelemetryPoint[]) {
    const avg = this.average(points);
    return points
      .filter((point) => point.temperatura > 35 || point.temperatura > avg + 9)
      .map((point) => ({
        type: 'temperature',
        severity: point.temperatura > 38 ? 'critical' : 'warning',
        timestamp: point.timestamp,
        value: point.temperatura,
        message: `Temperatura anormal: ${point.temperatura.toFixed(2)} C`,
      }));
  }

  forecast(points: TelemetryPoint[], horizon = 12) {
    const ordered = points.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const last = ordered.slice(-24);
    const base = this.average(last);
    const slope = last.length > 1 ? (last[last.length - 1].temperatura - last[0].temperatura) / last.length : 0;
    const start = ordered[ordered.length - 1]?.timestamp || new Date();

    return Array.from({ length: horizon }, (_, index) => ({
      timestamp: new Date(start.getTime() + (index + 1) * 60 * 60 * 1000),
      value: Number((base + slope * (index + 1)).toFixed(2)),
      unit: 'C',
    }));
  }
}
