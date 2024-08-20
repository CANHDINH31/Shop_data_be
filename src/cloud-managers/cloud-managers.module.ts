import { Module } from '@nestjs/common';
import { CloudManagersService } from './cloud-managers.service';
import { CloudManagersController } from './cloud-managers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CloudManager,
  CloudManagerSchema,
} from 'src/schemas/cloudManagers.schema';
import { Server, ServerSchema } from 'src/schemas/servers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CloudManager.name, schema: CloudManagerSchema },
      { name: Server.name, schema: ServerSchema },
    ]),
  ],
  controllers: [CloudManagersController],
  providers: [CloudManagersService],
})
export class CloudManagersModule {}
