import { IsNotEmpty, IsString } from 'class-validator';

export class RenameKeyDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
