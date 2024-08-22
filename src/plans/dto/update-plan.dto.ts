import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  day: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  description: string[];

  @IsOptional()
  @IsNumber()
  bandWidth: number;

  @IsOptional()
  @IsNumber()
  display?: number;

  @IsOptional()
  @IsNumber()
  enable?: number;
}
