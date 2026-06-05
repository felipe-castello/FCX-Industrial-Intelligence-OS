import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { AcquisitionPayload } from '../types/acquisition.types';
import { MqttGatewayService } from './mqtt-gateway.service';

@Injectable()
export class MqttPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttPublisherService.name);
  private client?: mqtt.MqttClient;

  constructor(private readonly gateway: MqttGatewayService) {}

  onModuleInit() {
    this.client = this.gateway.createClient(`fcx-acquisition-publisher-${Date.now()}`);
    this.client.on('connect', () => this.logger.log('MQTT publisher connected.'));
    this.client.on('error', (error) => this.logger.error(`MQTT publisher error: ${error.message}`));
  }

  publish(topic: string, payload: AcquisitionPayload) {
    return new Promise<{ topic: string; payload: AcquisitionPayload }>((resolve, reject) => {
      this.client?.publish(topic, JSON.stringify(payload), { qos: 0 }, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ topic, payload });
      });
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }
}
