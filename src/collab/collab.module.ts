import { Module } from '@nestjs/common';
import { CollabService } from './collab.service';
import { CollabController } from './collab.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collab, CollabSchema } from 'src/schemas/collabs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Collab.name, schema: CollabSchema }]),
  ],
  controllers: [CollabController],
  providers: [CollabService],
})
export class CollabModule {
  constructor(private readonly collabService: CollabService) {}
  async onModuleInit() {
    await this.collabService.createDefaulCollab();
  }
}
