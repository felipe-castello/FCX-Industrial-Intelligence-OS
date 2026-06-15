import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class CarelBossService {
  constructor(
    private readonly config: ConfigService,
    private readonly ingestion: DataIngestionService,
  ) {}

  async pullTelemetry(assetId: string, bossDeviceId: string) {
    const baseUrl = this.config.get<string>('CAREL_BOSS_URL');
    const token = this.config.get<string>('CAREL_BOSS_TOKEN');
    const { data } = await axios.get(`${baseUrl}/api/devices/${bossDeviceId}/telemetry`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.ingestion.ingest('carel-boss', { assetId, ...data });
  }
}
