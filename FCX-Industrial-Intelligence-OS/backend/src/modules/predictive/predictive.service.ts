import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlarmCorrelationEngineService } from './services/alarm-correlation-engine.service';
import { AssetHealthScoreService } from './services/asset-health-score.service';
import { EnergyAnalyticsService } from './services/energy-analytics.service';
import { TemperatureAnalyticsService } from './services/temperature-analytics.service';
import { VibrationAnalyticsService } from './services/vibration-analytics.service';
import { PredictiveModelsService } from './services/predictive-models.service';

@Injectable()
export class PredictiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly energy: EnergyAnalyticsService,
    private readonly vibration: VibrationAnalyticsService,
    private readonly temperature: TemperatureAnalyticsService,
    private readonly healthScore: AssetHealthScoreService,
    private readonly alarmCorrelation: AlarmCorrelationEngineService,
    private readonly models: PredictiveModelsService,
  ) {}

  async health(assetId?: string) {
    const assets = await this.loadAssetsWithSignals(assetId);
    const health = assets.map((asset) => this.calculateAssetHealth(asset));

    return {
      generatedAt: new Date(),
      totalAssets: health.length,
      averageHealthScore: this.round(this.average(health.map((item) => item.healthScore))),
      assets: health.sort((a, b) => a.healthScore - b.healthScore),
    };
  }

  async anomalies(assetId?: string) {
    const assets = await this.loadAssetsWithSignals(assetId);
    const anomalies = assets.flatMap((asset) => {
      const telemetry = asset.telemetry;
      const baseline = telemetry.slice(1);
      const latest = telemetry[0];
      const isolationScore = latest ? this.models.isolationForestAnomalyScore(latest, baseline) : 0;
      return [
        ...this.temperature.detectAnomalies(telemetry),
        ...this.vibration.detectAnomalies(telemetry),
        ...this.energy.detectAnomalies(telemetry),
        ...(latest && isolationScore >= 60
          ? [
              {
                type: 'isolation-forest',
                severity: isolationScore >= 82 ? 'critical' : 'warning',
                timestamp: latest.timestamp,
                value: isolationScore,
                message: `Isolation Forest score elevado: ${isolationScore}`,
              },
            ]
          : []),
      ].map((anomaly) => ({
        assetId: asset.id,
        assetName: asset.nome,
        criticality: asset.criticidade,
        model: anomaly.type === 'isolation-forest' ? 'Isolation Forest' : 'Rules + Statistical Baseline',
        ...anomaly,
      }));
    });

    return {
      generatedAt: new Date(),
      total: anomalies.length,
      anomalies: anomalies
        .sort((a, b) => this.severityRank(b.severity) - this.severityRank(a.severity))
        .slice(0, 250),
    };
  }

  async forecast(assetId?: string) {
    const assets = await this.loadAssetsWithSignals(assetId);
    const forecasts = assets.map((asset) => {
      const ordered = asset.telemetry.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const start = ordered[ordered.length - 1]?.timestamp || new Date();
      const temperatureValues = ordered.slice(-48).map((point) => point.temperatura);
      const energyValues = ordered.slice(-48).map((point) => point.potencia);

      return {
        assetId: asset.id,
        assetName: asset.nome,
        models: {
          temperature: 'Regression',
          energy: 'Regression',
        },
        temperatureForecast: this.models.regressionForecast(temperatureValues).map((value, index) => ({
          timestamp: new Date(start.getTime() + (index + 1) * 60 * 60 * 1000),
          value,
          unit: 'C',
        })),
        energyForecast: this.models.regressionForecast(energyValues).map((value, index) => ({
          timestamp: new Date(start.getTime() + (index + 1) * 60 * 60 * 1000),
          value,
          unit: 'kW',
        })),
        failureTrend: this.vibration.failureTrend(asset.telemetry),
      };
    });

    return {
      generatedAt: new Date(),
      horizonHours: 12,
      forecasts,
    };
  }

  async failure(assetId?: string) {
    const assets = await this.loadAssetsWithSignals(assetId);
    const failures = assets.map((asset) => {
      const health = this.calculateAssetHealth(asset);
      const randomForestRisk = this.models.randomForestFailureRisk(asset.telemetry, health.alarmCorrelation.correlationScore);
      const xgboostRisk = this.models.xgboostFailureRisk(
        asset.telemetry,
        health.healthScore,
        health.alarmCorrelation.correlationScore,
      );
      const riskScore = Math.round(randomForestRisk * 0.45 + xgboostRisk * 0.55);

      return {
        assetId: asset.id,
        assetName: asset.nome,
        riskScore,
        riskLevel: riskScore >= 75 ? 'high' : riskScore >= 45 ? 'medium' : 'low',
        models: {
          randomForestRisk,
          xgboostRisk,
        },
        failureTrend: health.failureTrend,
        healthScore: health.healthScore,
        recommendations: this.failureRecommendations(riskScore, health.failureTrend.status),
      };
    });

    return {
      generatedAt: new Date(),
      models: ['Random Forest', 'XGBoost', 'Vibration Failure Trend'],
      failures: failures.sort((a, b) => b.riskScore - a.riskScore),
    };
  }

  async dashboard() {
    const [health, anomalies, forecast, failure] = await Promise.all([
      this.health(),
      this.anomalies(),
      this.forecast(),
      this.failure(),
    ]);
    const assets = health.assets;
    const criticalAssets = assets.slice(0, 10);
    const failureTrends = forecast.forecasts
      .map((item) => ({ assetId: item.assetId, assetName: item.assetName, ...item.failureTrend }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    const selectedForecast = forecast.forecasts[0] || {
      temperatureForecast: [],
      energyForecast: [],
    };

    return {
      generatedAt: new Date(),
      kpis: {
        averageHealthScore: health.averageHealthScore,
        criticalAssets: assets.filter((asset) => asset.classification === 'critical').length,
        anomalies: anomalies.total,
        failureTrendAssets: failureTrends.filter((item) => item.status === 'failure-trend').length,
        maxFailureRisk: failure.failures[0]?.riskScore || 0,
      },
      widgets: {
        healthScoreByAsset: assets,
        topCriticalAssets: criticalAssets,
        failureRisk: failure.failures.slice(0, 10),
        failureTrends,
        predictedConsumption: selectedForecast.energyForecast,
        predictedTemperature: selectedForecast.temperatureForecast,
        anomalies: anomalies.anomalies.slice(0, 20),
      },
    };
  }

  private async loadAssetsWithSignals(assetId?: string) {
    return this.prisma.asset.findMany({
      where: assetId ? { id: assetId } : undefined,
      include: {
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 160,
        },
        alarms: {
          orderBy: { timestamp: 'desc' },
          take: 80,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private calculateAssetHealth(asset: any) {
    const telemetry = asset.telemetry;
    const alarmCorrelation = this.alarmCorrelation.correlate(asset.alarms);
    const failureTrend = this.vibration.failureTrend(telemetry);
    const avgTemperature = this.temperature.average(telemetry);
    const avgVibration = this.vibration.average(telemetry);
    const avgEnergy = this.energy.average(telemetry);
    const score = this.healthScore.calculate({
      avgTemperature,
      avgVibration,
      avgEnergy,
      alarmCorrelationScore: alarmCorrelation.correlationScore,
      status: asset.status,
      criticality: asset.criticidade,
      failureTrendStatus: failureTrend.status,
    });

    return {
      assetId: asset.id,
      assetName: asset.nome,
      type: asset.tipo,
      unit: asset.unidade,
      criticality: asset.criticidade,
      status: asset.status,
      healthScore: score,
      classification: this.healthScore.classify(score),
      averages: {
        temperature: this.round(avgTemperature),
        vibration: this.round(avgVibration),
        energy: this.round(avgEnergy),
      },
      failureTrend,
      alarmCorrelation,
    };
  }

  private average(values: number[]) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }

  private severityRank(severity: string) {
    return severity === 'critical' ? 3 : severity === 'warning' ? 2 : 1;
  }

  private failureRecommendations(riskScore: number, trendStatus: string) {
    if (riskScore >= 75 || trendStatus === 'failure-trend') {
      return ['Planejar intervencao tecnica', 'Inspecionar vibracao, temperatura e consumo', 'Verificar historico de alarmes'];
    }
    if (riskScore >= 45) {
      return ['Acompanhar tendencia operacional', 'Validar carga eletrica e condicoes ambientais'];
    }
    return ['Manter monitoramento padrao'];
  }
}
