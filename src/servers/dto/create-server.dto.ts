import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
