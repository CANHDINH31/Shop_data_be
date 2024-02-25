import { Controller, Get, Param } from '@nestjs/common';
import { SatisfyService } from './satisfy.service';

@Controller('satisfy')
export class SatisfyController {
  constructor(private readonly satisfyService: SatisfyService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.satisfyService.findOne(id);
  }
}
