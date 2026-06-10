import { Controller, Get, Query } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Get()
  overview(@Query('companyId') companyId?: string) {
    return this.service.overview(companyId);
  }
}
