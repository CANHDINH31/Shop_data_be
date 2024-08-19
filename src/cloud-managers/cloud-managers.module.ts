import { Module } from '@nestjs/common';
import { CloudManagersService } from './cloud-managers.service';
import { CloudManagersController } from './cloud-managers.controller';

@Module({
  controllers: [CloudManagersController],
  providers: [CloudManagersService]
})
export class CloudManagersModule {}
