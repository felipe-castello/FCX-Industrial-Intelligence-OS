import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AcquisitionTelemetryService } from './acquisition-telemetry.service';

@Injectable()
export class SitradProConnectorService {
  constructor(
    private readonly config: ConfigService,
    private readonly telemetry: AcquisitionTelemetryService,
  ) {}

  async pull(assetId: string, controllerId: string) {
    const baseUrl = this.config.get<string>('SITRAD_PRO_URL');
    const token = this.config.get<string>('SITRAD_PRO_TOKEN');
    const { data } = await axios.get(`${baseUrl}/api/controllers/${controllerId}/telemetry`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return this.telemetry.ingestRaw('sitrad-pro', 'sitrad-pro', { assetId, ...data });
  }
}
