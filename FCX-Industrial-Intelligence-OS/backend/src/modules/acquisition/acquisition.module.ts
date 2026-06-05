import { Module } from '@nestjs/common';
import { AcquisitionController } from './acquisition.controller';
import { AcquisitionService } from './acquisition.service';
import { AcquisitionAlarmService } from './services/acquisition-alarm.service';
import { AcquisitionAssetService } from './services/acquisition-asset.service';
import { AcquisitionTelemetryService } from './services/acquisition-telemetry.service';
import { CarelBossConnectorService } from './services/carel-boss-connector.service';
import { ModbusTcpGatewayService } from './services/modbus-tcp-gateway.service';
import { MqttGatewayService } from './services/mqtt-gateway.service';
import { MqttPublisherService } from './services/mqtt-publisher.service';
import { MqttSubscriberService } from './services/mqtt-subscriber.service';
import { SitradProConnectorService } from './services/sitrad-pro-connector.service';
import { ThingsBoardConnectorService } from './services/thingsboard-connector.service';

@Module({
  controllers: [AcquisitionController],
  providers: [
    AcquisitionService,
    AcquisitionAssetService,
    AcquisitionTelemetryService,
    AcquisitionAlarmService,
    MqttGatewayService,
    MqttSubscriberService,
    MqttPublisherService,
    ModbusTcpGatewayService,
    CarelBossConnectorService,
    SitradProConnectorService,
    ThingsBoardConnectorService,
  ],
  exports: [AcquisitionService, AcquisitionTelemetryService, AcquisitionAlarmService, MqttPublisherService],
})
export class AcquisitionModule {}
