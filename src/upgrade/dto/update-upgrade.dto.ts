import { PartialType } from '@nestjs/swagger';
import { CreateUpgradeDto } from './create-upgrade.dto';

export class UpdateUpgradeDto extends PartialType(CreateUpgradeDto) {}
