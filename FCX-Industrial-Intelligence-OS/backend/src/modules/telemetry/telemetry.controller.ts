import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly service: TelemetryService) {}

  @Get()
  findAll(@Query('assetId') assetId?: string, @Query('limit') limit?: string, @Query('companyId') companyId?: string) {
    return this.service.findAll(assetId, limit ? Number(limit) : undefined, companyId);
  }

  @Get('latest')
  latest(@Query('companyId') companyId?: string) {
    return this.service.latest(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Record<string, unknown>) {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
