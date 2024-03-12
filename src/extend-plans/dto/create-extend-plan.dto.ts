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
}
