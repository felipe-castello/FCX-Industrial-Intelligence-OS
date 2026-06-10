import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() @IsNotEmpty() document?: string;
  @IsOptional() @IsString() @IsNotEmpty() contactName?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() @IsNotEmpty() contactPhone?: string;
  @IsOptional() @IsIn(['ACTIVE', 'INACTIVE']) status?: string;
}
