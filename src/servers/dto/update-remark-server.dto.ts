import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRemarkServerDto {
  @IsNotEmpty()
  @IsString()
  remark: string;
}
