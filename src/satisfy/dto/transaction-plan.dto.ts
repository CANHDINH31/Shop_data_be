import { IsNotEmpty, IsString } from 'class-validator';

export class TransactionPlanDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}
