import { Module } from '@nestjs/common';
import { GistsService } from './gists.service';
import { GistsController } from './gists.controller';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Commision, CommisionSchema } from 'src/schemas/commisions.schema';
import { Rose, RoseSchema } from 'src/schemas/roses.schema';
import { Collab, CollabSchema } from 'src/schemas/collabs.schema';
import { AWSSchema, Aws } from 'src/schemas/awses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Commision.name, schema: CommisionSchema },
    ]),
    MongooseModule.forFeature([{ name: Rose.name, schema: RoseSchema }]),
    MongooseModule.forFeature([{ name: Collab.name, schema: CollabSchema }]),
    MongooseModule.forFeature([{ name: Aws.name, schema: AWSSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [GistsController],
  providers: [GistsService],
})
export class GistsModule {}
