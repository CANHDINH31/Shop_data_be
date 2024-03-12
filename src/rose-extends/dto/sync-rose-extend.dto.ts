import { IsNotEmpty, IsNumber } from 'class-validator';

export class SyncRoseExtendDto {
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
