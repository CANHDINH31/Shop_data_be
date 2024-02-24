import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UpgradesService } from './upgrades.service';
import { UpdateUpgradeDto } from './dto/update-upgrade.dto';
import { BandWidthUpgradeDto } from './dto/band-width-upgrade.dto';
import { PlanUpgradeDto } from './dto/plan-upgrade.dto';

@Controller('upgrades')
export class UpgradesController {
  constructor(private readonly upgradesService: UpgradesService) {}

  @Post('band-width')
  upgradeBandwidth(@Body() bandWidthUpgradeDto: BandWidthUpgradeDto) {
    return this.upgradesService.upgradeBandwidth(bandWidthUpgradeDto);
  }

  @Post('/plan')
  upgradePlan(@Body() planUpgradeDto: PlanUpgradeDto) {
    return this.upgradesService.upgradePlan(planUpgradeDto);
  }

  @Get()
  findAll() {
    return this.upgradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.upgradesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUpgradeDto: UpdateUpgradeDto) {
    return this.upgradesService.update(+id, updateUpgradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.upgradesService.remove(+id);
  }
}
