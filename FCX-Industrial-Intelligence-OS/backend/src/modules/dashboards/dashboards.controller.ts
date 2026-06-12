import { Controller, Get, Query } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Get()
  overview(@Query('companyId') companyId?: string, @Query('clientId') clientId?: string, @Query('siteId') siteId?: string, @Query('assetId') assetId?: string, @Query('deviceId') deviceId?: string) {
    return this.service.overview({ companyId, clientId, siteId, assetId, deviceId });
  }
}
