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
import { UpdateStatusServerDto } from './dto/update-status-server.dto';
import { UpdateCloudManagerDto } from './dto/update-cloud-manager.dto';

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

  @Get('/server-to-migrate')
  getServerToMigrate(@Req() req) {
    return this.serversService.getServerToMigrate(req);
  }

  @Get('/normal-server')
  getNormalServer(@Req() req) {
    return this.serversService.getNormalServer(req);
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

  @Patch('/status-server/:id')
  updateStautsServer(
    @Param('id') id: string,
    @Body() updateStatusServerDto: UpdateStatusServerDto,
  ) {
    return this.serversService.updateStautsServer(id, updateStatusServerDto);
  }

  @Patch('/cloud-manager/:id')
  updateCloudManager(
    @Param('id') id: string,
    @Body() updateCloudManagerDto: UpdateCloudManagerDto,
  ) {
    return this.serversService.updateCloudManager(id, updateCloudManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.serversService.remove(id, req);
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
