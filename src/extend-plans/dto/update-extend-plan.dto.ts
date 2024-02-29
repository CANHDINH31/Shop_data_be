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

  @IsOptional()
  @IsNumber()
  level1?: number;

  @IsOptional()
  @IsNumber()
  level2?: number;

  @IsOptional()
  @IsNumber()
  level3?: number;
}
