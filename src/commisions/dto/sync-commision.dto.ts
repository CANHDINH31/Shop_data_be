import { IsNotEmpty, IsNumber } from 'class-validator';

export class SyncCommisionDto {
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsNumber()
  min: number;
}
