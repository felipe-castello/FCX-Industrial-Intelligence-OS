import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateClientDto, CreateDeviceDto, UpdateClientDto, UpdateDeviceDto } from './dto/safe-registry.dto';
import { SafeRegistryService } from './safe-registry.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: SafeRegistryService) {}
  @Get() findAll() { return this.service.clients(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.client(id); }
  @Post() create(@Body() data: CreateClientDto) { return this.service.createClient(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateClientDto) { return this.service.updateClient(id, data); }
  @Put(':id') replace(@Param('id') id: string, @Body() data: UpdateClientDto) { return this.service.updateClient(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.removeClient(id); }
}

@Controller('devices')
export class DevicesController {
  constructor(private readonly service: SafeRegistryService) {}
  @Get() findAll(@Query('assetId') assetId?: string) { return this.service.devices(assetId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.device(id); }
  @Post() create(@Body() data: CreateDeviceDto) { return this.service.createDevice(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateDeviceDto) { return this.service.updateDevice(id, data); }
  @Put(':id') replace(@Param('id') id: string, @Body() data: UpdateDeviceDto) { return this.service.updateDevice(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.removeDevice(id); }
}
