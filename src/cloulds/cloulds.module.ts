import { Module } from '@nestjs/common';
import { ClouldsService } from './cloulds.service';
import { ClouldsController } from './cloulds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cloud, CloudSchema } from 'src/schemas/clouds.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cloud.name, schema: CloudSchema }]),
  ],
  controllers: [ClouldsController],
  providers: [ClouldsService],
})
export class ClouldsModule {}
