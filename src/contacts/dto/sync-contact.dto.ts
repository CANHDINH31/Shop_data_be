import { IsNotEmpty, IsString } from 'class-validator';

export class SyncContactDto {
  @IsString()
  @IsNotEmpty()
  wechat: string;

  @IsString()
  @IsNotEmpty()
  zalo: string;

  @IsString()
  @IsNotEmpty()
  whatapp: string;
}
