import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateExtendPlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  bandWidth: number;

  @IsNotEmpty()
  @IsNumber()
  level1: number;

  @IsNotEmpty()
  @IsNumber()
  level2: number;

  @IsNotEmpty()
  @IsNumber()
  level3: number;
}
