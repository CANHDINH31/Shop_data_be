import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddDataLimitDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;

  @IsNotEmpty()
  @IsNumber()
  bytes: number;
}
