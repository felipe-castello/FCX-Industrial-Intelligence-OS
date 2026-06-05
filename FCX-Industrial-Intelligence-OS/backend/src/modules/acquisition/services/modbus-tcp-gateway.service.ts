import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModbusRTU = require('modbus-serial');
import { AcquisitionTelemetryService } from './acquisition-telemetry.service';

@Injectable()
export class ModbusTcpGatewayService {
  private readonly logger = new Logger(ModbusTcpGatewayService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly telemetry: AcquisitionTelemetryService,
  ) {}

  async read(assetId: string) {
    const client = new ModbusRTU();
    const host = this.config.get<string>('MODBUS_HOST') || '127.0.0.1';
    const port = Number(this.config.get<string>('MODBUS_PORT') || 502);
    const unitId = Number(this.config.get<string>('MODBUS_UNIT_ID') || 1);

    try {
      await client.connectTCP(host, { port });
      client.setID(unitId);
      const registers = await client.readHoldingRegisters(0, 10);
      const payload = {
        assetId,
        temperatura: registers.data[0] / 10,
        vibracao: registers.data[1] / 100,
        corrente: registers.data[2] / 10,
        tensao: registers.data[3],
        potencia: registers.data[4] / 10,
        pressao: registers.data[5] / 10,
        pressaoSuccao: registers.data[6] / 10,
        pressaoDescarga: registers.data[7] / 10,
        umidade: registers.data[8] / 10,
      };

      return this.telemetry.ingestRaw('modbus-tcp', 'modbus-tcp', payload);
    } catch (error) {
      this.logger.error(`Modbus TCP gateway read failed: ${(error as Error).message}`);
      throw error;
    } finally {
      client.close(() => undefined);
    }
  }
}
