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
import { AddKeyDto } from './dto/add-key.dto';
import { RenameKeyDto } from './dto/rename-key.dto';
import { RemoveKeyDto } from './dto/remove-key.dto';
import { DisableKeyDto } from './dto/disable-key.dto';
import { EnableKeyDto } from './dto/enable-key.dto';
import { AddDataLimitDto } from './dto/add-data-limit.dto';
import { UpdateLocationServerDto } from './dto/update-location-server.dto';
import { UpdateNameServerDto } from './dto/update-name-server.dto';

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
    return this.serversService.findOne(id);
  }

  @Patch('/location/:id')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocationServerDto: UpdateLocationServerDto,
  ) {
    return this.serversService.updateLocation(id, updateLocationServerDto);
  }

  @Patch('/name-server/:id')
  updateNameServer(
    @Param('id') id: string,
    @Body() updateNameServerDto: UpdateNameServerDto,
  ) {
    return this.serversService.updateNameServer(id, updateNameServerDto);
  }

  @Post('/add-key')
  addKey(@Body() addKeyDto: AddKeyDto) {
    return this.serversService.addKey(addKeyDto);
  }

  @Patch('/rename-key/:id')
  renameKey(@Param('id') id: string, @Body() renameKeyDto: RenameKeyDto) {
    return this.serversService.renameKey(id, renameKeyDto);
  }

  @Patch('/disable-key/:id')
  disableKey(@Param('id') id: string, @Body() disableKeyDto: DisableKeyDto) {
    return this.serversService.disableKey(id, disableKeyDto);
  }

  @Patch('/enable-key/:id')
  enableKey(@Param('id') id: string, @Body() enableKeyDto: EnableKeyDto) {
    return this.serversService.enableKey(id, enableKeyDto);
  }

  @Patch('/add-data-limit/:id')
  addDataLimit(
    @Param('id') id: string,
    @Body() addDataLimitDto: AddDataLimitDto,
  ) {
    return this.serversService.addDataLimit(id, addDataLimitDto);
  }

  @Delete('/remove-key/:id')
  removeKey(@Param('id') id: string, @Body() removeKeyDto: RemoveKeyDto) {
    return this.serversService.removeKey(id, removeKeyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serversService.remove(id);
  }
}
