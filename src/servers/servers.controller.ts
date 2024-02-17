import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { UpdateServerDto } from './dto/update-server.dto';
import { SyncServerDto } from './dto/sync-server.dto';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  create(@Body() syncServerDto: SyncServerDto) {
    return this.serversService.sync(syncServerDto);
  }

  @Get()
  findAll() {
    return this.serversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serversService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return this.serversService.update(+id, updateServerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serversService.remove(id);
  }
}
