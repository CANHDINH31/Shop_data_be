import { PartialType } from '@nestjs/swagger';
import { SyncServerDto } from './sync-server.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLimitNumberKeyDto extends PartialType(SyncServerDto) {
  @IsNotEmpty()
  @IsNumber()
  limitNumberKey?: number;
}
