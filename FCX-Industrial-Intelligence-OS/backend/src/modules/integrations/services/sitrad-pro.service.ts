import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class SitradProService {
  constructor(
    private readonly config: ConfigService,
    private readonly ingestion: DataIngestionService,
  ) {}

  async pullTelemetry(assetId: string, controllerId: string) {
    const baseUrl = this.config.get<string>('SITRAD_PRO_URL');
    const token = this.config.get<string>('SITRAD_PRO_TOKEN');
    const { data } = await axios.get(`${baseUrl}/api/controllers/${controllerId}/telemetry`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.ingestion.ingest('sitrad-pro', { assetId, ...data });
  }
}
