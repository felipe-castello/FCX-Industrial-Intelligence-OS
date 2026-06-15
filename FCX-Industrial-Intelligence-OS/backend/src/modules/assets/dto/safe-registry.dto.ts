import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() cnpj: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsOptional() @IsIn(['ACTIVE', 'INACTIVE']) status?: string;
}

export class UpdateClientDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() cnpj?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsIn(['ACTIVE', 'INACTIVE']) status?: string;
}

export class CreateDeviceDto {
  @IsOptional() @IsString() @IsNotEmpty() assetId?: string | null;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() serialNumber: string;
  @IsString() @IsNotEmpty() deviceType: string;
  @IsString() @IsNotEmpty() protocol: string;
  @IsOptional() @IsIn(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALERT', 'INACTIVE']) status?: string;
}

export class UpdateDeviceDto {
  @IsOptional() @IsString() @IsNotEmpty() assetId?: string | null;
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() serialNumber?: string;
  @IsOptional() @IsString() @IsNotEmpty() deviceType?: string;
  @IsOptional() @IsString() @IsNotEmpty() protocol?: string;
  @IsOptional() @IsIn(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALERT', 'INACTIVE']) status?: string;
}
