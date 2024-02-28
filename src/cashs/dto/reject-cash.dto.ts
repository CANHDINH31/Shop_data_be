import { IsOptional, IsString } from 'class-validator';

export class RejectCashDto {
  @IsOptional()
  @IsString()
  description: string;
}
