import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttGatewayService {
  constructor(private readonly config: ConfigService) {}

  createClient(clientId: string) {
    const url = this.config.get<string>('MQTT_URL') || 'mqtt://localhost:1883';
    return mqtt.connect(url, { clientId });
  }
}
