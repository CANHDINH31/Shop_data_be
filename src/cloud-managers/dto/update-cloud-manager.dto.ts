import { PartialType } from '@nestjs/swagger';
import { CreateCloudManagerDto } from './create-cloud-manager.dto';

export class UpdateCloudManagerDto extends PartialType(CreateCloudManagerDto) {}
