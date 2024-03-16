import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SatisfyService } from './satisfy.service';
import { CashDto } from './dto/cash.dto';
import { TransactionPlanDto } from './dto/transaction-plan.dto';
import { TransactionExtendPlanDto } from './dto/transaction-extend-plan.dto';
import { GetByMonthDto } from './dto/getByMonth.dto';
import { GetByYearDto } from './dto/getByYear.dto';

@Controller('satisfy')
export class SatisfyController {
  constructor(private readonly satisfyService: SatisfyService) {}

  @Get('/server')
  server() {
    return this.satisfyService.server();
  }

  @Get('/top-plan')
  topPlan() {
    return this.satisfyService.topPlan();
  }

  @Get('/get-by-level')
  getByLevel() {
    return this.satisfyService.getByLevel();
  }

  @Get('/get-top-user')
  getTopUser() {
    return this.satisfyService.getTopUser();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.satisfyService.findOne(id);
  }

  @Post('/cash')
  cash(@Body() cashDto: CashDto) {
    return this.satisfyService.cash(cashDto);
  }

  @Post('/get-by-month')
  getByMonth(@Body() getByMonthDto: GetByMonthDto) {
    return this.satisfyService.getByMonth(getByMonthDto);
  }

  @Post('/get-by-year')
  getByYear(@Body() getByYearDto: GetByYearDto) {
    return this.satisfyService.getByYear(getByYearDto);
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
