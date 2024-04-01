import { IsNotEmpty, IsString } from 'class-validator';

export class GetTopUserByMonthDto {
  @IsNotEmpty()
  @IsString()
  month: string;
}
