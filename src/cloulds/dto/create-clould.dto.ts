import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClouldDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
