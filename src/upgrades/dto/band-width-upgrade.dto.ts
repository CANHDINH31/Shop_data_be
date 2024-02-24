import { IsNotEmpty, IsString } from 'class-validator';

export class BandWidthUpgradeDto {
  @IsNotEmpty()
  @IsString()
  gistId: string;

  @IsNotEmpty()
  @IsString()
  extendPlanId: string;
}
