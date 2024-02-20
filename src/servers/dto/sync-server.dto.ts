import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncServerDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;

  @IsOptional()
  @IsNumber()
  limitNumberKey: number;
}
