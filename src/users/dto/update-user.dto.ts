import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
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
}
