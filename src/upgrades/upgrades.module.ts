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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExtendPlan.name, schema: ExtendPlanSchema },
    ]),
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [UpgradesController],
  providers: [UpgradesService],
})
export class UpgradesModule {}
