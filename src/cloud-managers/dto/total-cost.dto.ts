import { IsNotEmpty, IsString } from 'class-validator';

export class TotalCostDto {
  @IsNotEmpty()
  @IsString()
  month: string;
}
