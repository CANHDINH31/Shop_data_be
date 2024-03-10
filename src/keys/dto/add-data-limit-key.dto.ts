import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddDataLimitKey {
  @IsNotEmpty()
  @IsNumber()
  data: number;
}
