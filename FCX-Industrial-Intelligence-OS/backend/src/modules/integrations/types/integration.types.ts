export type IntegrationSource = 'mqtt-emqx' | 'modbus-tcp' | 'carel-boss' | 'sitrad-pro' | 'thingsboard' | 'fcx-gateway' | 'api';

export type IndustrialTelemetryPayload = {
  assetId?: string;
  externalId?: string;
  timestamp?: string | Date;
  temperatura?: number;
  vibracao?: number;
  corrente?: number;
  tensao?: number;
  potencia?: number;
  energia?: number;
  pressaoSuccao?: number;
  pressao_succao?: number;
  pressaoDescarga?: number;
  pressao_descarga?: number;
  [key: string]: unknown;
};

export type ProcessedTelemetry = {
  source: IntegrationSource;
  assetId?: string;
  timestamp: Date;
  temperatura: number;
  vibracao: number;
  corrente: number;
  tensao: number;
  potencia: number;
  pressaoSuccao: number;
  pressaoDescarga: number;
  raw: IndustrialTelemetryPayload;
};
