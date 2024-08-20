import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCloudManagerDto {
  @IsNotEmpty()
  @IsString()
  cloudManagerId: string;
}
