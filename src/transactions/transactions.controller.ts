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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { HistoryExtendPlanTransactionDto } from './dto/history-extend-plan-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Post('history-extend-plan')
  historyExtendPlan(
    @Body() historyExtendPlanTransactionDto: HistoryExtendPlanTransactionDto,
  ) {
    return this.transactionsService.historyExtendPlan(
      historyExtendPlanTransactionDto,
    );
  }

  @Post('history-upgrade-plan')
  historyUpgradePlan(
    @Body() historyExtendPlanTransactionDto: HistoryExtendPlanTransactionDto,
  ) {
    return this.transactionsService.historyUpgradePlan(
      historyExtendPlanTransactionDto,
    );
  }

  @Get('test')
  test(@Req() req) {
    return this.transactionsService.test();
  }

  @Get()
  findAll(@Req() req) {
    return this.transactionsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
