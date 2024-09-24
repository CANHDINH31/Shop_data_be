import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateStatusCloudManagerDto {
  @IsNotEmpty()
  @IsNumber()
  status?: number;
}
