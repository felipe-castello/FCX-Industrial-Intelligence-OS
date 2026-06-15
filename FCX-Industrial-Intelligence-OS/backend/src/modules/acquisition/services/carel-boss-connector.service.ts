import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AcquisitionTelemetryService } from './acquisition-telemetry.service';

@Injectable()
export class CarelBossConnectorService {
  constructor(
    private readonly config: ConfigService,
    private readonly telemetry: AcquisitionTelemetryService,
  ) {}

  async pull(assetId: string, deviceId: string) {
    const baseUrl = this.config.get<string>('CAREL_BOSS_URL');
    const token = this.config.get<string>('CAREL_BOSS_TOKEN');
    const { data } = await axios.get(`${baseUrl}/api/devices/${deviceId}/telemetry`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return this.telemetry.ingestRaw('carel-boss', 'carel-boss', { assetId, ...data });
  }
}
