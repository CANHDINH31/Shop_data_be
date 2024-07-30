import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { KumaService } from './kuma.service';
import { UpdateKumaDto } from './dto/update-kuma.dto';

@Controller('kuma')
export class KumaController {
  constructor(private readonly kumaService: KumaService) {}

  @Post()
  monitor(@Body() monitorKumaDto: any) {
    return this.kumaService.monitor(monitorKumaDto);
  }

  @Get()
  findAll() {
    return this.kumaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kumaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKumaDto: UpdateKumaDto) {
    return this.kumaService.update(+id, updateKumaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kumaService.remove(+id);
  }
}
