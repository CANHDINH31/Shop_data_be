import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGistDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
