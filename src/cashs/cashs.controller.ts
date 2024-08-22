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
import { CashByAdminDto } from './dto/cash-by-admin.dto';

@Controller('cashs')
export class CashsController {
  constructor(private readonly cashsService: CashsService) {}

  @Post('/auto-bank')
  autoBank(@Body() createCashDto: CreateCashDto) {
    return this.cashsService.autoBank(createCashDto);
  }

  @Post('/cash-by-admin')
  cashByAdmin(@Body() cashByAdminDto: CashByAdminDto) {
    return this.cashsService.cashByAdmin(cashByAdminDto);
  }

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
