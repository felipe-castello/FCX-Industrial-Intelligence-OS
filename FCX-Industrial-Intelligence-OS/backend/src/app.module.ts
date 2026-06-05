import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetsModule } from './modules/assets/assets.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { AlarmsModule } from './modules/alarms/alarms.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AgentsModule } from './modules/agents/agents.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { UsersModule } from './modules/users/users.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { DatabaseModule } from './database/database.module';
import { PredictiveModule } from './modules/predictive/predictive.module';
import { AcquisitionModule } from './modules/acquisition/acquisition.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    MetricsModule,
    DatabaseModule,
    AssetsModule,
    TelemetryModule,
    AlarmsModule,
    WorkOrdersModule,
    UsersModule,
    DashboardsModule,
    PredictiveModule,
    AcquisitionModule,
    IntegrationsModule,
    AgentsModule,
  ],
})
export class AppModule {}
