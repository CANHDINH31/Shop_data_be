import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServerDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;

  @IsNotEmpty()
  @IsNumber()
  totalBandWidth?: number;

  @IsOptional()
  @IsString()
  cloudManagerId?: string;
}
