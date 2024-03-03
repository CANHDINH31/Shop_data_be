import { IsNotEmpty, IsString } from 'class-validator';

export class TransactionExtendPlanDto {
  @IsNotEmpty()
  @IsString()
  extendPlanId: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}
