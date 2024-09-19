import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { AWSSchema, Aws } from 'src/schemas/awses.schema';
import { KeysService } from 'src/keys/keys.service';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Collab, CollabSchema } from 'src/schemas/collabs.schema';
import { Test, TestSchema } from 'src/schemas/tests.schema';
import {
  SettingBandwidth,
  SettingBandwidthSchema,
} from 'src/schemas/settingBandwidths.schema';
import { KumaService } from 'src/kuma/kuma.service';
import { BullModule } from '@nestjs/bullmq';
import { DataUsageConsumer } from './servers.consumer';
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
      name: 'data-usage',
    }),
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
  controllers: [ServersController],
  providers: [ServersService, KeysService, KumaService, DataUsageConsumer],
})
export class ServersModule {
  constructor(private readonly serversService: ServersService) {}

  async onModuleInit() {
    await this.serversService.createDefaulBandWidth();
  }
}
