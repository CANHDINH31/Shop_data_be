import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  day: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  description: string[];

  @IsNotEmpty()
  @IsNumber()
  bandWidth: number;

  @IsOptional()
  @IsNumber()
  display?: number;

  @IsOptional()
  @IsNumber()
  enable?: number;
}
