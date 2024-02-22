import { Controller, Get, Post, Body } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { SyncDownloadDto } from './dto/sync-download.dto';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  sync(@Body() syncDownloadDto: SyncDownloadDto) {
    return this.downloadsService.sync(syncDownloadDto);
  }

  @Get()
  find() {
    return this.downloadsService.find();
  }
}
