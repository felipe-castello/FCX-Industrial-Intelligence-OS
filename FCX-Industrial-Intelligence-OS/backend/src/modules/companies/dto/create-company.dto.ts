import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() document: string;
  @IsString() @IsNotEmpty() contactName: string;
  @IsEmail() contactEmail: string;
  @IsString() @IsNotEmpty() contactPhone: string;
  @IsOptional() @IsIn(['ACTIVE', 'INACTIVE']) status?: string;
}
