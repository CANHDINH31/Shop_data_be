import { Module } from '@nestjs/common';
import { SatisfyService } from './satisfy.service';
import { SatisfyController } from './satisfy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cash, CashSchema } from 'src/schemas/cashs.schema';
import { Rose, RoseSchema } from 'src/schemas/roses.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cash.name, schema: CashSchema }]),
    MongooseModule.forFeature([{ name: Rose.name, schema: RoseSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [SatisfyController],
  providers: [SatisfyService],
})
export class SatisfyModule {}
