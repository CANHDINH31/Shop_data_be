import { Module } from '@nestjs/common';
import { ExtendPlansService } from './extend-plans.service';
import { ExtendPlansController } from './extend-plans.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtendPlan, ExtendPlanSchema } from 'src/schemas/extendPlans.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExtendPlan.name, schema: ExtendPlanSchema },
    ]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [ExtendPlansController],
  providers: [ExtendPlansService],
})
export class ExtendPlansModule {}
