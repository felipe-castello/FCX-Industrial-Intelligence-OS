import { Module } from '@nestjs/common';
import { IntegrationsApiController } from './integrations-api.controller';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { AlarmEngineService } from './services/alarm-engine.service';
import { CarelBossService } from './services/carel-boss.service';
import { DataIngestionService } from './services/data-ingestion.service';
import { FcxGatewayService } from './services/fcx-gateway.service';
import { ModbusTcpService } from './services/modbus-tcp.service';
import { MqttEmqxService } from './services/mqtt-emqx.service';
import { PredictiveEngineService } from './services/predictive-engine.service';
import { SitradProService } from './services/sitrad-pro.service';
import { TelemetryProcessingService } from './services/telemetry-processing.service';
import { ThingsBoardService } from './services/thingsboard.service';

@Module({
  controllers: [IntegrationsController, IntegrationsApiController],
  providers: [
    IntegrationsService,
    DataIngestionService,
    TelemetryProcessingService,
    AlarmEngineService,
    PredictiveEngineService,
    MqttEmqxService,
    ModbusTcpService,
    CarelBossService,
    SitradProService,
    ThingsBoardService,
    FcxGatewayService,
  ],
  exports: [IntegrationsService, DataIngestionService],
})
export class IntegrationsModule {}
