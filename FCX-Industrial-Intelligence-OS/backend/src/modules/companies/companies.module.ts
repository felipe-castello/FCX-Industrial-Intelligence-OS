import { Module } from '@nestjs/common';
import { DashboardsModule } from '../dashboards/dashboards.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({ imports: [DashboardsModule], controllers: [CompaniesController], providers: [CompaniesService], exports: [CompaniesService] })
export class CompaniesModule {}
