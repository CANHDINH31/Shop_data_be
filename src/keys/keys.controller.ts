import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { KeysService } from './keys.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { MigrateKeyDto } from './dto/migrate-key.dto';
import { AddDataLimitKey } from './dto/add-data-limit-key.dto';
import { RenameKeyDto } from './dto/rename-key.dto';
import { MultiMigrateKeyDto } from './dto/multi-migrate-key.dto';
import { EndDateKeyDto } from './dto/end-date-key.dto';

@Controller('keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Get('/test')
  test() {
    return this.keysService.test();
  }

  @Post('/multi-migrate')
  multiMigrate(@Body() multiMigrateKeyDto: MultiMigrateKeyDto) {
    return this.keysService.multiMigrate(multiMigrateKeyDto);
  }

  @Post('/migrate')
  migrate(@Body() migrateKeyDto: MigrateKeyDto) {
    return this.keysService.migrate(migrateKeyDto);
  }

  @Post()
  create(@Body() createKeyDto: CreateKeyDto) {
    return this.keysService.create(createKeyDto);
  }

  @Get('/today-info')
  todayInfo() {
    return this.keysService.todayInfo();
  }

  @Get('/outline-data-usage')
  findAllWithOutlineDataUsage(@Req() req) {
    return this.keysService.findAllWithOutlineDataUsage(req);
  }

  @Get()
  findAll(@Req() req) {
    return this.keysService.findAll(req);
  }

  @Get('/disable/:id')
  disable(@Param('id') id: string) {
    return this.keysService.disableByAdmin(id);
  }

  @Get('/enable/:id')
  enable(@Param('id') id: string) {
    return this.keysService.enableByAdmin(id);
  }

  @Patch('/add-data-limit/:id')
  addDataLimit(
    @Param('id') id: string,
    @Body() addDataLimitKey: AddDataLimitKey,
  ) {
    return this.keysService.addDataLimit(id, addDataLimitKey);
  }

  @Patch('/end-date/:id')
  updateEndDate(@Param('id') id: string, @Body() endDateKeyDto: EndDateKeyDto) {
    return this.keysService.updateEndDate(id, endDateKeyDto);
  }

  @Get('/cron')
  cron() {
    return this.keysService.checkExpireDataExpandKey();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keysService.findOne(id);
  }

  @Patch('/upgrade/:id')
  upgrade(@Param('id') id: string) {
    return this.keysService.upgrade(id);
  }

  @Patch('/rename/:id')
  rename(@Param('id') id: string, @Body() renameKeyDto: RenameKeyDto) {
    return this.keysService.rename(id, renameKeyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keysService.remove(id);
  }
}
