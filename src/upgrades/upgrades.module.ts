import { Module } from '@nestjs/common';
import { UpgradesService } from './upgrades.service';
import { UpgradesController } from './upgrades.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtendPlan, ExtendPlanSchema } from 'src/schemas/extendPlans.schema';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import { Collab, CollabSchema } from 'src/schemas/collabs.schema';
import { RoseExtend, RoseExtendSchema } from 'src/schemas/roseExtends.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExtendPlan.name, schema: ExtendPlanSchema },
    ]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Collab.name, schema: CollabSchema }]),
    MongooseModule.forFeature([
      { name: RoseExtend.name, schema: RoseExtendSchema },
    ]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [UpgradesController],
  providers: [UpgradesService],
})
export class UpgradesModule {}
