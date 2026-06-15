import { Controller, Get, Query } from '@nestjs/common';
import { PredictiveService } from './predictive.service';

@Controller('predictive')
export class PredictiveController {
  constructor(private readonly service: PredictiveService) {}

  @Get('health')
  health(@Query('assetId') assetId?: string) {
    return this.service.health(assetId);
  }

  @Get('anomalies')
  anomalies(@Query('assetId') assetId?: string) {
    return this.service.anomalies(assetId);
  }

  @Get('anomaly')
  anomaly(@Query('assetId') assetId?: string) {
    return this.service.anomalies(assetId);
  }

  @Get('failure')
  failure(@Query('assetId') assetId?: string) {
    return this.service.failure(assetId);
  }

  @Get('forecast')
  forecast(@Query('assetId') assetId?: string) {
    return this.service.forecast(assetId);
  }

  @Get('dashboard')
  dashboard() {
    return this.service.dashboard();
  }
}
