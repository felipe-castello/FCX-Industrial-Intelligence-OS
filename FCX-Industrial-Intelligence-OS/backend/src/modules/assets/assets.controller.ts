import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset-management.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('clientId') clientId?: string, @Query('siteId') siteId?: string, @Query('deviceId') deviceId?: string) {
    return this.service.findAll({ companyId, clientId, siteId, deviceId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: CreateAssetDto) {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAssetDto) {
    return this.service.update(id, data);
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() data: UpdateAssetDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
