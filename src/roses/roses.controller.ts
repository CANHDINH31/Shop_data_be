import { Controller, Get, Req } from '@nestjs/common';
import { RosesService } from './roses.service';

@Controller('roses')
export class RosesController {
  constructor(private readonly rosesService: RosesService) {}

  @Get()
  findAll(@Req() req) {
    return this.rosesService.findAll(req);
  }
}
