import { Module } from '@nestjs/common';
import { KumaService } from './kuma.service';
import { KumaController } from './kuma.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { KeysService } from 'src/keys/keys.service';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { Aws, AWSSchema } from 'src/schemas/awses.schema';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { Test, TestSchema } from 'src/schemas/tests.schema';
import {
  SettingBandwidth,
  SettingBandwidthSchema,
} from 'src/schemas/settingBandwidths.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Collab, CollabSchema } from 'src/schemas/collabs.schema';
import { BullModule } from '@nestjs/bullmq';
import { KumaMonitorConsumer } from './kuma.consumer';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Aws.name, schema: AWSSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
    MongooseModule.forFeature([
      { name: SettingBandwidth.name, schema: SettingBandwidthSchema },
    ]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    MongooseModule.forFeature([{ name: Collab.name, schema: CollabSchema }]),
    BullModule.registerQueue({
      name: 'expried-key',
    }),
    BullModule.registerQueue({
      name: 'expried-data-expand-key',
    }),
    BullModule.registerQueue({
      name: 'kuma-monitor',
    }),
  ],
  controllers: [KumaController],
  providers: [KumaService, KeysService, KumaMonitorConsumer],
})
export class KumaModule {}
