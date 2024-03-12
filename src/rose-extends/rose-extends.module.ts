import { Module } from '@nestjs/common';
import { RoseExtendsService } from './rose-extends.service';
import { RoseExtendsController } from './rose-extends.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoseExtend, RoseExtendSchema } from 'src/schemas/roseExtends.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoseExtend.name, schema: RoseExtendSchema },
    ]),
  ],
  controllers: [RoseExtendsController],
  providers: [RoseExtendsService],
})
export class RoseExtendsModule {
  constructor(private readonly roseExtendsService: RoseExtendsService) {}

  async onModuleInit() {
    await this.roseExtendsService.createDefaultRoseExtend();
  }
}
