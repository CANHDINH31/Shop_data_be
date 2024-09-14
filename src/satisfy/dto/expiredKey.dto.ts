import { IsNotEmpty, IsString } from 'class-validator';

export class ExpiredKeyDto {
  @IsNotEmpty()
  @IsString()
  day: string;
}
