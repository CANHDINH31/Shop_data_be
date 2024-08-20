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
import { CloudManagersService } from './cloud-managers.service';
import { CreateCloudManagerDto } from './dto/create-cloud-manager.dto';
import { UpdateCloudManagerDto } from './dto/update-cloud-manager.dto';

@Controller('cloud-managers')
export class CloudManagersController {
  constructor(private readonly cloudManagersService: CloudManagersService) {}

  @Post()
  async create(@Body() createCloudManagerDto: CreateCloudManagerDto) {
    try {
      return this.cloudManagersService.create(createCloudManagerDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  findAll(@Req() req) {
    return this.cloudManagersService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cloudManagersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCloudManagerDto: UpdateCloudManagerDto,
  ) {
    return this.cloudManagersService.update(id, updateCloudManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cloudManagersService.remove(id);
  }
}
