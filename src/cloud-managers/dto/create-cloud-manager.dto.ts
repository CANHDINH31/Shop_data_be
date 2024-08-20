import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCloudManagerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsNumber()
  status: number;

  @IsNotEmpty()
  @IsString()
  cloudId: string;

  @IsNotEmpty()
  @IsString()
  providerId: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsNotEmpty()
  @IsString()
  remark?: string;
}
