import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Key, KeySchema } from 'src/schemas/keys.schema';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { AWSSchema, Aws } from 'src/schemas/awses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Aws.name, schema: AWSSchema }]),
  ],
  controllers: [ServersController],
  providers: [ServersService],
})
export class ServersModule {}
