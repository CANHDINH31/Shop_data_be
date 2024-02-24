import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommisionsService } from './commisions.service';
import { SyncCommisionDto } from './dto/sync-commision.dto';

@Controller('commisions')
export class CommisionsController {
  constructor(private readonly commisionsService: CommisionsService) {}

  @Post()
  sync(@Body() syncCommisionDto: SyncCommisionDto) {
    return this.commisionsService.sync(syncCommisionDto);
  }

  @Get()
  find() {
    return this.commisionsService.find();
  }
}
