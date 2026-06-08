import { Injectable } from '@nestjs/common';
import { FEATURE_FLAGS, isFeatureEnabled, safeModuleFallback } from '../feature-flags';

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

  syncExternal(payload: Record<string, unknown>) {
    if (!isFeatureEnabled(FEATURE_FLAGS.nango)) {
      return {
        ...safeModuleFallback('nango', 'ENABLE_NANGO=false'),
        sync: {
          status: 'disabled',
          connector: payload?.connector || 'unknown',
          supportedConnectors: ['gmail', 'google-drive', 'google-sheets', 'github', 'erp', 'sitrad', 'thingsboard', 'external-api'],
        },
      };
    }

    try {
      return {
        module: 'nango',
        status: 'ready',
        sync: {
          status: 'queued',
          connector: payload?.connector || 'unknown',
          mode: 'oauth-safe-sync',
        },
      };
    } catch (error) {
      return safeModuleFallback('nango', error instanceof Error ? error.message : 'unknown error');
    }
  }
}
