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

@Controller('keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Post()
  migrate(@Body() migrateKeyDto: MigrateKeyDto) {
    return this.keysService.migrate(migrateKeyDto);
  }

  @Post()
  create(@Body() createKeyDto: CreateKeyDto) {
    return this.keysService.create(createKeyDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.keysService.findAll(req);
  }

  @Get('/cron')
  cron() {
    return this.keysService.checkExpiredKey();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keysService.findOne(+id);
  }

  @Patch('/upgrade/:id')
  upgrade(@Param('id') id: string) {
    return this.keysService.upgrade(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keysService.remove(id);
  }
}
