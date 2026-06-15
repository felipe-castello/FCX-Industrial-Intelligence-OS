import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class MqttEmqxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttEmqxService.name);
  private client?: mqtt.MqttClient;

  constructor(
    private readonly config: ConfigService,
    private readonly ingestion: DataIngestionService,
  ) {}

  onModuleInit() {
    const url = this.config.get<string>('MQTT_URL') || 'mqtt://localhost:1883';
    const topic = this.config.get<string>('MQTT_TELEMETRY_TOPIC') || 'fcx/telemetry/+';

    this.client = mqtt.connect(url, { clientId: `fcx-backend-${Date.now()}` });

    this.client.on('connect', () => {
      this.logger.log(`Connected to EMQX at ${url}`);
      this.client?.subscribe(topic);
    });

    this.client.on('message', async (topicName, message) => {
      try {
        const payload = JSON.parse(message.toString());
        await this.ingestion.ingest('mqtt-emqx', payload);
      } catch (error) {
        this.logger.error(`Invalid MQTT payload on ${topicName}: ${(error as Error).message}`);
      }
    });

    this.client.on('error', (error) => this.logger.error(`MQTT error: ${error.message}`));
  }

  onModuleDestroy() {
    this.client?.end();
  }
}
