import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModbusRTU = require('modbus-serial');
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class ModbusTcpService {
  private readonly logger = new Logger(ModbusTcpService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly ingestion: DataIngestionService,
  ) {}

  async readAndIngest(assetId: string) {
    const client = new ModbusRTU();
    const host = this.config.get<string>('MODBUS_HOST') || '127.0.0.1';
    const port = Number(this.config.get<string>('MODBUS_PORT') || 502);
    const unitId = Number(this.config.get<string>('MODBUS_UNIT_ID') || 1);

    try {
      await client.connectTCP(host, { port });
      client.setID(unitId);
      const registers = await client.readHoldingRegisters(0, 8);
      const [temperatura, vibracao, corrente, tensao, energia] = registers.data.map((value: number) => value / 10);

      return this.ingestion.ingest('modbus-tcp', {
        assetId,
        temperatura,
        vibracao,
        corrente,
        tensao,
        energia,
        pressaoSuccao: registers.data[5] / 10,
        pressaoDescarga: registers.data[6] / 10,
      });
    } catch (error) {
      this.logger.error(`Modbus TCP read failed: ${(error as Error).message}`);
      throw error;
    } finally {
      client.close(() => undefined);
    }
  }
}
