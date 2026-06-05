import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  findAll() {
    return {
      module: 'integrations',
      status: 'ready',
      connectors: [
        { id: 'mqtt-emqx', name: 'MQTT EMQX', status: 'configured' },
        { id: 'modbus-tcp', name: 'Modbus TCP', status: 'configured' },
        { id: 'carel-boss', name: 'Carel BOSS', status: 'configured' },
        { id: 'sitrad-pro', name: 'Sitrad Pro', status: 'configured' },
        { id: 'thingsboard', name: 'ThingsBoard', status: 'configured' },
        { id: 'fcx-gateway', name: 'Gateway IoT FCX', status: 'configured' },
      ],
    };
  }

  architecture() {
    return {
      layers: [
        'Data Ingestion Layer',
        'Telemetry Processing',
        'Alarm Engine',
        'Predictive Engine',
        'Dashboard Layer',
      ],
      flow: 'Data Ingestion Layer -> Telemetry Processing -> Alarm Engine -> Predictive Engine -> Dashboard Layer',
    };
  }
}
