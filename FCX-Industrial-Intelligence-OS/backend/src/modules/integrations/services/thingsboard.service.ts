import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class ThingsBoardService {
  constructor(
    private readonly config: ConfigService,
    private readonly ingestion: DataIngestionService,
  ) {}

  async pullTelemetry(assetId: string, deviceId: string) {
    const baseUrl = this.config.get<string>('THINGSBOARD_URL');
    const token = this.config.get<string>('THINGSBOARD_TOKEN');
    const keys = 'temperatura,vibracao,corrente,tensao,potencia,pressaoSuccao,pressaoDescarga';
    const { data } = await axios.get(`${baseUrl}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { keys },
    });

    const latest = Object.fromEntries(
      Object.entries(data).map(([key, values]) => [key, Number((values as Array<{ value: string }>)[0]?.value || 0)]),
    );

    return this.ingestion.ingest('thingsboard', { assetId, ...latest });
  }
}
