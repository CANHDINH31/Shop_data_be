import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { GistsService } from 'src/gists/gists.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, GistsService],
})
export class TransactionsModule {}
