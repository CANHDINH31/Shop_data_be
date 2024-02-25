import { PartialType } from '@nestjs/swagger';
import { CreateCollabDto } from './create-collab.dto';

export class UpdateCollabDto extends PartialType(CreateCollabDto) {}
