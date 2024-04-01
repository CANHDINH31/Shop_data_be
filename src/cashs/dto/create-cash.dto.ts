import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCashDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  money: number;

  @IsOptional()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  type: number;
}
