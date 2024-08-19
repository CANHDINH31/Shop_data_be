import { PartialType } from '@nestjs/swagger';
import { CreateClouldDto } from './create-clould.dto';

export class UpdateClouldDto extends PartialType(CreateClouldDto) {}
