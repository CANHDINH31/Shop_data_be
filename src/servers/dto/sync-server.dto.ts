import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncServerDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;

  @IsNotEmpty()
  @IsOptional()
  location: string;

  @IsOptional()
  @IsNumber()
  totalBandWidth?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsString()
  cloudManagerId?: string;

  @IsOptional()
  @IsString()
  isCheckUnique?: string;
}
