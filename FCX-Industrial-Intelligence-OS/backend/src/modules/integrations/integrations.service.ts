import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  findAll(companyId?: string) {
    return {
      module: 'integrations',
      companyId: companyId || null,
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

  syncExternal(payload: Record<string, unknown>) {
    return {
      module: 'external-integration-sync',
      status: 'disabled',
      reason: 'External services are not connected in the local operational runtime.',
      sync: {
        connector: payload?.connector || 'unknown',
        mode: 'governed-local-simulation',
      },
    };
  }
}
