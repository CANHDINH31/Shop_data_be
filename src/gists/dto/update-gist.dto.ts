import { PartialType } from '@nestjs/swagger';
import { CreateGistDto } from './create-gist.dto';

export class UpdateGistDto extends PartialType(CreateGistDto) {}
