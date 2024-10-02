import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateKumaDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  hostname: string;

  @IsNotEmpty()
  @IsString()
  portC: string;

  @IsNotEmpty()
  @IsNumber()
  status: number;
}
