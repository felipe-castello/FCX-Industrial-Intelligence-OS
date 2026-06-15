import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { AcquisitionTelemetryService } from './acquisition-telemetry.service';
import { MqttGatewayService } from './mqtt-gateway.service';

@Injectable()
export class MqttSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttSubscriberService.name);
  private client?: mqtt.MqttClient;

  constructor(
    private readonly config: ConfigService,
    private readonly gateway: MqttGatewayService,
    private readonly telemetry: AcquisitionTelemetryService,
  ) {}

  onModuleInit() {
    const topic = this.config.get<string>('MQTT_TELEMETRY_TOPIC') || 'fcx/telemetry/+';
    this.client = this.gateway.createClient(`fcx-acquisition-subscriber-${Date.now()}`);

    this.client.on('connect', () => {
      this.logger.log(`MQTT subscriber connected. topic=${topic}`);
      this.client?.subscribe(topic);
    });

    this.client.on('message', async (topicName, message) => {
      try {
        const payload = JSON.parse(message.toString());
        await this.telemetry.ingestRaw('emqx', 'mqtt', payload, topicName);
      } catch (error) {
        this.logger.error(`MQTT acquisition error topic=${topicName}: ${(error as Error).message}`);
      }
    });

    this.client.on('error', (error) => this.logger.error(`MQTT subscriber error: ${error.message}`));
  }

  onModuleDestroy() {
    this.client?.end();
  }
}
