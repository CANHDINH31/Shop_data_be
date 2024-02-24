import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UpgradeService } from './upgrade.service';
import { CreateUpgradeDto } from './dto/create-upgrade.dto';
import { UpdateUpgradeDto } from './dto/update-upgrade.dto';

@Controller('upgrade')
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @Post()
  create(@Body() createUpgradeDto: CreateUpgradeDto) {
    return this.upgradeService.create(createUpgradeDto);
  }

  @Get()
  findAll() {
    return this.upgradeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.upgradeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUpgradeDto: UpdateUpgradeDto) {
    return this.upgradeService.update(+id, updateUpgradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.upgradeService.remove(+id);
  }
}
