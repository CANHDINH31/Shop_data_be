import { IsNotEmpty, IsString } from 'class-validator';

export class AddKeyDto {
  @IsNotEmpty()
  @IsString()
  apiUrl: string;

  @IsNotEmpty()
  @IsString()
  fingerPrint: string;
}
