import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SatisfyService } from './satisfy.service';
import { CashDto } from './dto/cash.dto';
import { TransactionPlanDto } from './dto/transaction-plan.dto';
import { TransactionExtendPlanDto } from './dto/transaction-extend-plan.dto';

@Controller('satisfy')
export class SatisfyController {
  constructor(private readonly satisfyService: SatisfyService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.satisfyService.findOne(id);
  }

  @Post('/cash')
  cash(@Body() cashDto: CashDto) {
    return this.satisfyService.cash(cashDto);
  }

  @Post('/transaction-plan')
  transactionPlan(@Body() transactionPlanDto: TransactionPlanDto) {
    return this.satisfyService.transactionPlan(transactionPlanDto);
  }

  @Post('/transaction-extend-plan')
  transactionExtendPlan(
    @Body() transactionExtendPlanDto: TransactionExtendPlanDto,
  ) {
    return this.satisfyService.transactionExtendPlan(transactionExtendPlanDto);
  }
}
