import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BandWidthUpgradeDto {
  @IsNotEmpty()
  @IsString()
  gistId: string;

  @IsNotEmpty()
  @IsString()
  extendPlanId: string;

  @IsNotEmpty()
  @IsNumber()
  month: number;
}
