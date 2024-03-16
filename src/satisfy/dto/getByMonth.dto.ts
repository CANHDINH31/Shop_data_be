import { IsNotEmpty, IsString } from 'class-validator';

export class GetByMonthDto {
  @IsNotEmpty()
  @IsString()
  month: string;
}
