import { IsNotEmpty, IsString } from 'class-validator';

export class GetByYearDto {
  @IsNotEmpty()
  @IsString()
  year: string;
}
