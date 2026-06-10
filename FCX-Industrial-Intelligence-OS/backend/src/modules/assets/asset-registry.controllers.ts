import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AssetRegistryService } from './asset-registry.service';
import { CreateGatewayDto, CreateSensorDto, CreateSiteDto, UpdateGatewayDto, UpdateSensorDto, UpdateSiteDto } from './dto/asset-management.dto';

@Controller('sites')
export class SitesController {
  constructor(private readonly service: AssetRegistryService) {}
  @Get() findAll(@Query('companyId') companyId?: string) { return this.service.sites(companyId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.site(id); }
  @Post() create(@Body() data: CreateSiteDto) { return this.service.createSite(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateSiteDto) { return this.service.updateSite(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.removeSite(id); }
}

@Controller('sensors')
export class SensorsController {
  constructor(private readonly service: AssetRegistryService) {}
  @Get() findAll(@Query('companyId') companyId?: string) { return this.service.sensors(companyId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.sensor(id); }
  @Post() create(@Body() data: CreateSensorDto) { return this.service.createSensor(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateSensorDto) { return this.service.updateSensor(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.removeSensor(id); }
}

@Controller('gateways')
export class GatewaysController {
  constructor(private readonly service: AssetRegistryService) {}
  @Get() findAll(@Query('companyId') companyId?: string) { return this.service.gateways(companyId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.gateway(id); }
  @Post() create(@Body() data: CreateGatewayDto) { return this.service.createGateway(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateGatewayDto) { return this.service.updateGateway(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.removeGateway(id); }
}
