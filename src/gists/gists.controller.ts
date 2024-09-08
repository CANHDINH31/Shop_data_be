import { UpdateExtensionGistDto } from './dto/update-extension-gist.dto';
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
import { BackUpGistDto } from './dto/back-gist.dto';

@Controller('gists')
export class GistsController {
  constructor(private readonly gistsService: GistsService) {}

  @Post('/back-up')
  backup(@Body() backUpGistDto: BackUpGistDto) {
    return this.gistsService.backUp(backUpGistDto);
  }

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

  @Patch('/extension/:id')
  updateExtension(
    @Param('id') id: string,
    @Body() updateExtensionGistDto: UpdateExtensionGistDto,
  ) {
    return this.gistsService.updateExtension(id, updateExtensionGistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gistsService.remove(id);
  }
}
