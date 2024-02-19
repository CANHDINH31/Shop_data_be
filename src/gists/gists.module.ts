import { Module } from '@nestjs/common';
import { GistsService } from './gists.service';
import { GistsController } from './gists.controller';
import { Gist, GistSchema } from 'src/schemas/gists.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from 'src/schemas/plans.schema';
import { Server, ServerSchema } from 'src/schemas/servers.schema';
import { Key, KeySchema } from 'src/schemas/keys.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gist.name, schema: GistSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
  ],
  controllers: [GistsController],
  providers: [GistsService],
})
export class GistsModule {}
