import { Controller, Get } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Get()
  overview() {
    return this.service.overview();
  }
}
