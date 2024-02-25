import { Controller, Post, Body, Get } from '@nestjs/common';
import { CollabService } from './collab.service';
import { SyncCollabDto } from './dto/sync-collab.dto';

@Controller('collab')
export class CollabController {
  constructor(private readonly collabService: CollabService) {}

  @Post()
  sync(@Body() syncCollabDto: SyncCollabDto) {
    return this.collabService.sync(syncCollabDto);
  }

  @Get()
  find() {
    return this.collabService.find();
  }
}
