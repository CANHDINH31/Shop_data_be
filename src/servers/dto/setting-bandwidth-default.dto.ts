import { IsNotEmpty, IsNumber } from 'class-validator';

export class SettingBandWidthDefaultDto {
  @IsNotEmpty()
  @IsNumber()
  value: number;
}
