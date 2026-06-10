import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CarelBossService } from './services/carel-boss.service';
import { DataIngestionService } from './services/data-ingestion.service';
import { FcxGatewayService } from './services/fcx-gateway.service';
import { ModbusTcpService } from './services/modbus-tcp.service';
import { SitradProService } from './services/sitrad-pro.service';
import { ThingsBoardService } from './services/thingsboard.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly service: IntegrationsService,
    private readonly ingestion: DataIngestionService,
    private readonly modbus: ModbusTcpService,
    private readonly carelBoss: CarelBossService,
    private readonly sitradPro: SitradProService,
    private readonly thingsBoard: ThingsBoardService,
    private readonly fcxGateway: FcxGatewayService,
  ) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('architecture')
  architecture() {
    return this.service.architecture();
  }

  @Post('ingest')
  ingest(@Body() payload: Record<string, unknown>) {
    return this.ingestion.ingest('api', payload);
  }

  @Post('modbus/read')
  readModbus(@Body() body: { assetId: string }) {
    return this.modbus.readAndIngest(body.assetId);
  }

  @Post('carel-boss/pull')
  pullCarelBoss(@Body() body: { assetId: string; deviceId: string }) {
    return this.carelBoss.pullTelemetry(body.assetId, body.deviceId);
  }

  @Post('sitrad-pro/pull')
  pullSitradPro(@Body() body: { assetId: string; controllerId: string }) {
    return this.sitradPro.pullTelemetry(body.assetId, body.controllerId);
  }

  @Post('thingsboard/pull')
  pullThingsBoard(@Body() body: { assetId: string; deviceId: string }) {
    return this.thingsBoard.pullTelemetry(body.assetId, body.deviceId);
  }

  @Post('fcx-gateway/pull')
  pullFcxGateway(@Body() body: { assetId: string; gatewayAssetId: string }) {
    return this.fcxGateway.pullTelemetry(body.assetId, body.gatewayAssetId);
  }
}
