import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateTotalBandwidthServerDto {
  @IsNotEmpty()
  @IsNumber()
  totalBandwidth: string;
}
