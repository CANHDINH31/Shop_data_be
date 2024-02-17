import { PartialType } from '@nestjs/swagger';
import { CreateServerDto } from './create-server.dto';

export class EnableKeyDto extends PartialType(CreateServerDto) {}
