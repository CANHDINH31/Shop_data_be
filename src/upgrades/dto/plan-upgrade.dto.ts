import { IsNotEmpty, IsString } from 'class-validator';

export class PlanUpgradeDto {
  @IsNotEmpty()
  @IsString()
  gistId: string;
}
