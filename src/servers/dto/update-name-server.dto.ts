import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameServerDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
