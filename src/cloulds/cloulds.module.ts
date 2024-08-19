import { Module } from '@nestjs/common';
import { ClouldsService } from './cloulds.service';
import { ClouldsController } from './cloulds.controller';

@Module({
  controllers: [ClouldsController],
  providers: [ClouldsService]
})
export class ClouldsModule {}
