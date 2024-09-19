import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveKumaDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
