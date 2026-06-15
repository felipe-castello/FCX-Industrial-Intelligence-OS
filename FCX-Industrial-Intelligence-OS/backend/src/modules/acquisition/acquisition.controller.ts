import { Body, Controller, Get, Post } from '@nestjs/common';
import { AcquisitionService } from './acquisition.service';
import { AcquisitionPayload } from './types/acquisition.types';
import { AcquisitionTelemetryService } from './services/acquisition-telemetry.service';
import { CarelBossConnectorService } from './services/carel-boss-connector.service';
import { ModbusTcpGatewayService } from './services/modbus-tcp-gateway.service';
import { MqttPublisherService } from './services/mqtt-publisher.service';
import { SitradProConnectorService } from './services/sitrad-pro-connector.service';
import { ThingsBoardConnectorService } from './services/thingsboard-connector.service';

@Controller('acquisition')
export class AcquisitionController {
  constructor(
    private readonly service: AcquisitionService,
    private readonly telemetry: AcquisitionTelemetryService,
    private readonly mqttPublisher: MqttPublisherService,
    private readonly modbus: ModbusTcpGatewayService,
    private readonly carelBoss: CarelBossConnectorService,
    private readonly sitradPro: SitradProConnectorService,
    private readonly thingsBoard: ThingsBoardConnectorService,
  ) {}

  @Get('architecture')
  architecture() {
    return this.service.architecture();
  }

  @Post('ingest')
  ingest(@Body() payload: AcquisitionPayload) {
    return this.telemetry.ingestRaw('api', 'api', payload);
  }

  @Post('mqtt/publish')
  publishMqtt(@Body() body: { topic: string; payload: AcquisitionPayload }) {
    return this.mqttPublisher.publish(body.topic, body.payload);
  }

  @Post('modbus/read')
  readModbus(@Body() body: { assetId: string }) {
    return this.modbus.read(body.assetId);
  }

  @Post('carel-boss/pull')
  pullCarelBoss(@Body() body: { assetId: string; deviceId: string }) {
    return this.carelBoss.pull(body.assetId, body.deviceId);
  }

  @Post('sitrad-pro/pull')
  pullSitradPro(@Body() body: { assetId: string; controllerId: string }) {
    return this.sitradPro.pull(body.assetId, body.controllerId);
  }

  @Post('thingsboard/pull')
  pullThingsBoard(@Body() body: { assetId: string; deviceId: string }) {
    return this.thingsBoard.pull(body.assetId, body.deviceId);
  }
}
