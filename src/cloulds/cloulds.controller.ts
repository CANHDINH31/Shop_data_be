import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClouldsService } from './cloulds.service';
import { CreateClouldDto } from './dto/create-clould.dto';
import { UpdateClouldDto } from './dto/update-clould.dto';

@Controller('cloulds')
export class ClouldsController {
  constructor(private readonly clouldsService: ClouldsService) {}

  @Post()
  create(@Body() createClouldDto: CreateClouldDto) {
    return this.clouldsService.create(createClouldDto);
  }

  @Get()
  findAll() {
    return this.clouldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clouldsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClouldDto: UpdateClouldDto) {
    return this.clouldsService.update(id, updateClouldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clouldsService.remove(id);
  }
}
