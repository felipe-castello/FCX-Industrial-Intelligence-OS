import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class FcxGatewayService {
  constructor(
    private readonly config: ConfigService,
    private readonly ingestion: DataIngestionService,
  ) {}

  async pullTelemetry(assetId: string, gatewayAssetId: string) {
    const baseUrl = this.config.get<string>('FCX_GATEWAY_URL');
    const { data } = await axios.get(`${baseUrl}/v1/assets/${gatewayAssetId}/telemetry/latest`);
    return this.ingestion.ingest('fcx-gateway', { assetId, ...data });
  }
}
