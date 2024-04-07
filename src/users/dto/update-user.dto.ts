import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  job?: string;

  @IsOptional()
  @IsNumber()
  purpose: number;

  @IsOptional()
  @IsNumber()
  level: number;

  @IsOptional()
  @IsBoolean()
  canMigrate?: boolean;
}
