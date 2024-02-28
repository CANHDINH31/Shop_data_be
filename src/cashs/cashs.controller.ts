import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CashsService } from './cashs.service';
import { CreateCashDto } from './dto/create-cash.dto';
import { RejectCashDto } from './dto/reject-cash.dto';

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

  @Post('/reject/:id')
  reject(@Param('id') id: string, @Body() rejectCashDto: RejectCashDto) {
    return this.cashsService.reject(id, rejectCashDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashsService.remove(+id);
  }
}
