import { IsNotEmpty, IsString } from 'class-validator';

export class SyncDownloadDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  device: string;
}
