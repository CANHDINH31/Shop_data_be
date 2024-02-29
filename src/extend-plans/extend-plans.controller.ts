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
import { ExtendPlansService } from './extend-plans.service';
import { CreateExtendPlanDto } from './dto/create-extend-plan.dto';
import { UpdateExtendPlanDto } from './dto/update-extend-plan.dto';

@Controller('extend-plans')
export class ExtendPlansController {
  constructor(private readonly extendPlansService: ExtendPlansService) {}

  @Post()
  create(@Body() createExtendPlanDto: CreateExtendPlanDto) {
    return this.extendPlansService.create(createExtendPlanDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.extendPlansService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.extendPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExtendPlanDto: UpdateExtendPlanDto,
  ) {
    return this.extendPlansService.update(id, updateExtendPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extendPlansService.remove(id);
  }
}
