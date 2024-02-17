import { PartialType } from '@nestjs/swagger';
import { CreateServerDto } from './create-server.dto';

export class RemoveKeyDto extends PartialType(CreateServerDto) {}
