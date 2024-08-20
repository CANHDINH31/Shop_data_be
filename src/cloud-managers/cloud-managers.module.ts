import { Module } from '@nestjs/common';
import { CloudManagersService } from './cloud-managers.service';
import { CloudManagersController } from './cloud-managers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CloudManager,
  CloudManagerSchema,
} from 'src/schemas/cloudManagers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CloudManager.name, schema: CloudManagerSchema },
    ]),
  ],
  controllers: [CloudManagersController],
  providers: [CloudManagersService],
})
export class CloudManagersModule {}
