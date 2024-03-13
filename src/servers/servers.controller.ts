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
import { ServersService } from './servers.service';
import { SyncServerDto } from './dto/sync-server.dto';
import { UpdateLocationServerDto } from './dto/update-location-server.dto';
import { UpdateNameServerDto } from './dto/update-name-server.dto';
import { MigrateServerDto } from './dto/migrate-server.dto';
import { SettingBandWidthDefaultDto } from './dto/setting-bandwidth-default.dto';
import { UpdateRemarkServerDto } from './dto/update-remark-server.dto';
import { UpdateTotalBandwidthServerDto } from './dto/update-total-bandwidth-server.dto';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post('/setting-bandwidth-default')
  settingBandWidthDefault(
    @Body() settingBandWidthDefaultDto: SettingBandWidthDefaultDto,
  ) {
    return this.serversService.settingBandWidthDefault(
      settingBandWidthDefaultDto,
    );
  }

  @Post('/migrate')
  migrate(@Body() migrateServerDto: MigrateServerDto) {
    return this.serversService.migrate(migrateServerDto);
  }

  @Post()
  create(@Body() syncServerDto: SyncServerDto) {
    return this.serversService.sync(syncServerDto);
  }

  @Get('/setting-bandwidth-default')
  findSettingBandwidthDefault() {
    return this.serversService.findSettingBandWidthDefault();
  }

  @Get()
  findAll(@Req() req) {
    return this.serversService.findAll(req);
  }

  @Patch('/location/:id')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocationServerDto: UpdateLocationServerDto,
  ) {
    return this.serversService.updateLocation(id, updateLocationServerDto);
  }

  @Patch('/remark/:id')
  updateRemark(
    @Param('id') id: string,
    @Body() updateRemarkServerDto: UpdateRemarkServerDto,
  ) {
    return this.serversService.updateRemark(id, updateRemarkServerDto);
  }

  @Patch('/total-bandwidth/:id')
  updateTotalBanwidth(
    @Param('id') id: string,
    @Body() updateTotalBandwidthServerDto: UpdateTotalBandwidthServerDto,
  ) {
    return this.serversService.updateTotalBanwidth(
      id,
      updateTotalBandwidthServerDto,
    );
  }

  @Patch('/name-server/:id')
  updateNameServer(
    @Param('id') id: string,
    @Body() updateNameServerDto: UpdateNameServerDto,
  ) {
    return this.serversService.updateNameServer(id, updateNameServerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serversService.remove(id);
  }

  @Get('/cron')
  cron() {
    return this.serversService.getDataUsage();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serversService.findOne(id);
  }
}
