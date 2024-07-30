import { PartialType } from '@nestjs/swagger';
import { CreateKumaDto } from './create-kuma.dto';

export class UpdateKumaDto extends PartialType(CreateKumaDto) {}
