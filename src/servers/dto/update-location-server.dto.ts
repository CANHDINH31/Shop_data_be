import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLocationServerDto {
  @IsNotEmpty()
  @IsString()
  location: string;
}
