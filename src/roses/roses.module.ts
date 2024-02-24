import { Module } from '@nestjs/common';
import { RosesService } from './roses.service';
import { RosesController } from './roses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Rose, RoseSchema } from 'src/schemas/roses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rose.name, schema: RoseSchema }]),
  ],
  controllers: [RosesController],
  providers: [RosesService],
})
export class RosesModule {}
