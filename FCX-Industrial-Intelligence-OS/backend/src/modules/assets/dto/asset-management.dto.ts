import { IsEmail, IsIn, IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const registryStatuses = ['ACTIVE', 'INACTIVE'];
const deviceStatuses = ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALERT'];
const assetStatuses = ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALARM'];
const assetCriticalities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const assetTypes = ['COMPRESSOR', 'RACK', 'COLD_ROOM', 'EVAPORATOR', 'CONDENSER', 'PANEL', 'SENSOR', 'PUMP', 'FAN', 'OTHER'];

export class CreateCompanyDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() document: string;
  @IsString() @IsNotEmpty() contactName: string;
  @IsEmail() contactEmail: string;
  @IsString() @IsNotEmpty() contactPhone: string;
  @IsOptional() @IsIn(registryStatuses) status?: string;
}

export class UpdateCompanyDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() document?: string;
  @IsOptional() @IsString() @IsNotEmpty() contactName?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() @IsNotEmpty() contactPhone?: string;
  @IsOptional() @IsIn(registryStatuses) status?: string;
}

export class CreateSiteDto {
  @IsString() @IsNotEmpty() companyId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsOptional() @IsIn(registryStatuses) status?: string;
}

export class UpdateSiteDto {
  @IsOptional() @IsString() @IsNotEmpty() companyId?: string;
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() address?: string;
  @IsOptional() @IsString() @IsNotEmpty() city?: string;
  @IsOptional() @IsString() @IsNotEmpty() state?: string;
  @IsOptional() @IsIn(registryStatuses) status?: string;
}

export class CreateAssetDto {
  @IsString() @IsNotEmpty() siteId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsIn(assetTypes) type: string;
  @IsOptional() @IsString() manufacturer?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsIn(assetCriticalities) criticality?: string;
  @IsOptional() @IsIn(assetStatuses) status?: string;
}

export class UpdateAssetDto {
  @IsOptional() @IsString() @IsNotEmpty() siteId?: string;
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsIn(assetTypes) type?: string;
  @IsOptional() @IsString() manufacturer?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsIn(assetCriticalities) criticality?: string;
  @IsOptional() @IsIn(assetStatuses) status?: string;
}

export class CreateSensorDto {
  @IsString() @IsNotEmpty() assetId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsNotEmpty() unit: string;
  @IsString() @IsNotEmpty() protocol: string;
  @IsOptional() @IsString() mqttTopic?: string;
  @IsOptional() @IsIn(deviceStatuses) status?: string;
}

export class UpdateSensorDto {
  @IsOptional() @IsString() @IsNotEmpty() assetId?: string;
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() type?: string;
  @IsOptional() @IsString() @IsNotEmpty() unit?: string;
  @IsOptional() @IsString() @IsNotEmpty() protocol?: string;
  @IsOptional() @IsString() mqttTopic?: string;
  @IsOptional() @IsIn(deviceStatuses) status?: string;
}

export class CreateGatewayDto {
  @IsString() @IsNotEmpty() siteId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() model: string;
  @IsIP() ipAddress: string;
  @IsString() @IsNotEmpty() protocol: string;
  @IsOptional() @IsIn(deviceStatuses) status?: string;
}

export class UpdateGatewayDto {
  @IsOptional() @IsString() @IsNotEmpty() siteId?: string;
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() model?: string;
  @IsOptional() @IsIP() ipAddress?: string;
  @IsOptional() @IsString() @IsNotEmpty() protocol?: string;
  @IsOptional() @IsIn(deviceStatuses) status?: string;
}
