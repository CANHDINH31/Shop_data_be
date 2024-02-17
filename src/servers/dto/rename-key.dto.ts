import { PartialType } from '@nestjs/swagger';
import { CreateServerDto } from './create-server.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameKeyDto extends PartialType(CreateServerDto) {
  @IsNotEmpty()
  @IsString()
  name: string;
}
