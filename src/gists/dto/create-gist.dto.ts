import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGistDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  planId: string;
}
