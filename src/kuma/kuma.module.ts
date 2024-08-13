import { Module } from '@nestjs/common';
import { KumaService } from './kuma.service';
import { KumaController } from './kuma.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
  ],
  controllers: [KumaController],
  providers: [KumaService],
})
export class KumaModule {}
