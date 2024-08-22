import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CashByAdminDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  money: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
