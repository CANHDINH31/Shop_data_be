import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateExtensionGistDto {
  @IsNotEmpty()
  @IsString()
  extension: string;
}
