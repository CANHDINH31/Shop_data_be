import { Module } from '@nestjs/common';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Collab, CollabSchema } from 'src/schemas/collabs.schema';
import { AWSSchema, Aws } from 'src/schemas/awses.schema';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Test, TestSchema } from 'src/schemas/tests.schema';
import { BullModule } from '@nestjs/bullmq';
import { ExpriedDataExpandKey, ExpriedKeyConsumer } from './keys.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    MongooseModule.forFeature([{ name: Aws.name, schema: AWSSchema }]),
    MongooseModule.forFeature([{ name: Collab.name, schema: CollabSchema }]),
    BullModule.registerQueue({
      name: 'expried-key',
    }),
    BullModule.registerQueue({
      name: 'expried-data-expand-key',
    }),
  ],
  controllers: [KeysController],
  providers: [KeysService, ExpriedKeyConsumer, ExpriedDataExpandKey],
})
export class KeysModule {}
