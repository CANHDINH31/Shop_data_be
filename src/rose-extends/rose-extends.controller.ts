import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoseExtendsService } from './rose-extends.service';
import { SyncRoseExtendDto } from './dto/sync-rose-extend.dto';

@Controller('rose-extends')
export class RoseExtendsController {
  constructor(private readonly roseExtendsService: RoseExtendsService) {}

  @Post()
  sync(@Body() syncRoseExtendDto: SyncRoseExtendDto) {
    return this.roseExtendsService.sync(syncRoseExtendDto);
  }

  @Get()
  find() {
    return this.roseExtendsService.find();
  }
}
