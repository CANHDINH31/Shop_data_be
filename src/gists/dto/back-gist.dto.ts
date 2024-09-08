import { IsNotEmpty, IsString } from 'class-validator';

export class BackUpGistDto {
  @IsNotEmpty()
  @IsString()
  keyId: string;
}
