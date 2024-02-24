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
import { GistsService } from './gists.service';
import { CreateGistDto } from './dto/create-gist.dto';
import { UpdateGistDto } from './dto/update-gist.dto';

@Controller('gists')
export class GistsController {
  constructor(private readonly gistsService: GistsService) {}

  @Post()
  create(@Body() createGistDto: CreateGistDto) {
    return this.gistsService.create(createGistDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.gistsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gistsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGistDto: UpdateGistDto) {
    return this.gistsService.update(id, updateGistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gistsService.remove(id);
  }
}
