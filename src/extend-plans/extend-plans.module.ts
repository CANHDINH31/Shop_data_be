import { Module } from '@nestjs/common';
import { ExtendPlansService } from './extend-plans.service';
import { ExtendPlansController } from './extend-plans.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { extendPlan, extendPlanSchema } from 'src/schemas/extendPlans.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: extendPlan.name, schema: extendPlanSchema },
    ]),
  ],
  controllers: [ExtendPlansController],
  providers: [ExtendPlansService],
})
export class ExtendPlansModule {}
