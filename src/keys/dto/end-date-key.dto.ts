import { IsNotEmpty, IsString } from 'class-validator';

export class EndDateKeyDto {
  @IsNotEmpty()
  @IsString()
  endDate: string;
}
