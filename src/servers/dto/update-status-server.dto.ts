import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateStatusServerDto {
  @IsNotEmpty()
  @IsNumber()
  status: number;
}
