import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id/assets') assets(@Param('id') id: string) { return this.service.assets(id); }
  @Get(':id/dashboard') dashboard(@Param('id') id: string) { return this.service.dashboard(id); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() data: CreateCompanyDto) { return this.service.create(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateCompanyDto) { return this.service.update(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
