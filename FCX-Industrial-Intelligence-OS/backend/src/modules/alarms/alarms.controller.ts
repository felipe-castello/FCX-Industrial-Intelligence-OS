import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AlarmsService } from './alarms.service';

@Controller('alarms')
export class AlarmsController {
  constructor(private readonly service: AlarmsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('companyId') companyId?: string) {
    return this.service.findAll(status, companyId);
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
