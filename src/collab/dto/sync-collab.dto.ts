import { IsNotEmpty, IsNumber } from 'class-validator';

export class SyncCollabDto {
  @IsNotEmpty()
  @IsNumber()
  level1: number;

  @IsNotEmpty()
  @IsNumber()
  level2: number;

  @IsNotEmpty()
  @IsNumber()
  level3: number;

  @IsNotEmpty()
  @IsNumber()
  minLevel1: number;

  @IsNotEmpty()
  @IsNumber()
  minLevel2: number;

  @IsNotEmpty()
  @IsNumber()
  minLevel3: number;
}
