import { IsNotEmpty, IsString } from 'class-validator';

export class CashDto {
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}
