import { Module } from '@nestjs/common';
import { GistsService } from './gists.service';
import { GistsController } from './gists.controller';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  controllers: [GistsController],
  providers: [GistsService],
})
export class GistsModule {}
