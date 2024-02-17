import { IsNotEmpty, IsString } from 'class-validator';

export class SyncServerDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;
}
