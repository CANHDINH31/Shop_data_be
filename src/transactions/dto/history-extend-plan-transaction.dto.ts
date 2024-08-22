import { IsNotEmpty, IsString } from 'class-validator';

export class HistoryExtendPlanTransactionDto {
  @IsNotEmpty()
  @IsString()
  keyId: string;
}
