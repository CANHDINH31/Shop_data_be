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
import { CashsService } from './cashs.service';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';

@Controller('cashs')
export class CashsController {
  constructor(private readonly cashsService: CashsService) {}

  @Post()
  create(@Body() createCashDto: CreateCashDto) {
    return this.cashsService.create(createCashDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.cashsService.findAll(req);
  }

  @Get('/approve/:id')
  approve(@Param('id') id: string) {
    return this.cashsService.approve(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCashDto: UpdateCashDto) {
    return this.cashsService.update(+id, updateCashDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashsService.remove(+id);
  }
}
