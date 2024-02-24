import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateExtendPlanDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  bandWidth: number;
}
