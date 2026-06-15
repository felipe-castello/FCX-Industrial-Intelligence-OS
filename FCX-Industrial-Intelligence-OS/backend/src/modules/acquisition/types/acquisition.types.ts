export type AcquisitionProtocol = 'mqtt' | 'modbus-tcp' | 'carel-boss' | 'sitrad-pro' | 'thingsboard' | 'fcx-gateway' | 'api';

export type AcquisitionPayload = {
  assetId?: string;
  externalId?: string;
  timestamp?: string | Date;
  temperatura?: number;
  temperature?: number;
  vibracao?: number;
  vibration?: number;
  corrente?: number;
  current?: number;
  tensao?: number;
  voltage?: number;
  potencia?: number;
  power?: number;
  energia?: number;
  pressao?: number;
  pressure?: number;
  pressaoSuccao?: number;
  pressao_succao?: number;
  pressaoDescarga?: number;
  pressao_descarga?: number;
  umidade?: number;
  humidity?: number;
  [key: string]: unknown;
};

export type NormalizedAcquisitionTelemetry = {
  assetId: string;
  timestamp: Date;
  temperatura?: number;
  vibracao?: number;
  corrente?: number;
  tensao?: number;
  potencia?: number;
  pressao?: number;
  pressaoSuccao?: number;
  pressaoDescarga?: number;
  umidade?: number;
};
