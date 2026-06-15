import { Injectable } from '@nestjs/common';

@Injectable()
export class AcquisitionService {
  architecture() {
    return {
      flow: [
        'Field Devices',
        'FCX Gateway',
        'EMQX MQTT',
        'NestJS Data Ingestion',
        'PostgreSQL TimescaleDB',
        'Grafana',
        'FCX Dashboard',
      ],
      tables: ['telemetry_raw', 'telemetry_processed', 'alarm_events'],
      services: ['MQTT Subscriber', 'MQTT Publisher', 'Telemetry Service', 'Alarm Service', 'Asset Service'],
      connectors: ['MQTT Gateway', 'Modbus TCP Gateway', 'Carel BOSS Connector', 'Sitrad Pro Connector', 'ThingsBoard Connector'],
    };
  }
}
