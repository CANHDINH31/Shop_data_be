import { PartialType } from '@nestjs/swagger';
import { CreateCashDto } from './create-cash.dto';

export class UpdateCashDto extends PartialType(CreateCashDto) {}
