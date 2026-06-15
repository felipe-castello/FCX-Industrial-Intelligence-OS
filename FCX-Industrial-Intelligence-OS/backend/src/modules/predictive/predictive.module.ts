import { Module } from '@nestjs/common';
import { PredictiveController } from './predictive.controller';
import { PredictiveService } from './predictive.service';
import { AlarmCorrelationEngineService } from './services/alarm-correlation-engine.service';
import { AssetHealthScoreService } from './services/asset-health-score.service';
import { EnergyAnalyticsService } from './services/energy-analytics.service';
import { TemperatureAnalyticsService } from './services/temperature-analytics.service';
import { VibrationAnalyticsService } from './services/vibration-analytics.service';
import { PredictiveModelsService } from './services/predictive-models.service';

@Module({
  controllers: [PredictiveController],
  providers: [
    PredictiveService,
    EnergyAnalyticsService,
    VibrationAnalyticsService,
    TemperatureAnalyticsService,
    AssetHealthScoreService,
    AlarmCorrelationEngineService,
    PredictiveModelsService,
  ],
  exports: [PredictiveService],
})
export class PredictiveModule {}
