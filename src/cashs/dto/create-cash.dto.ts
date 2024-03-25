import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCashDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  money: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;
}
