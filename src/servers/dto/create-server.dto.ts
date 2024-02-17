import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServerDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;
}
