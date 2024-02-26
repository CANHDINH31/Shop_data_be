import { Module } from '@nestjs/common';
import { CommisionsService } from './commisions.service';
import { CommisionsController } from './commisions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Commision, CommisionSchema } from 'src/schemas/commisions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commision.name, schema: CommisionSchema },
    ]),
  ],
  controllers: [CommisionsController],
  providers: [CommisionsService],
})
export class CommisionsModule {
  constructor(private readonly commisionsService: CommisionsService) {}

  async onModuleInit() {
    await this.commisionsService.createDefaultCommision();
  }
}
