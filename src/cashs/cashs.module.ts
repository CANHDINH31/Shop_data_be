import { Module } from '@nestjs/common';
import { CashsService } from './cashs.service';
import { CashsController } from './cashs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cash, CashSchema } from 'src/schemas/cashs.schema';
import { User, UserSchema } from 'src/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cash.name, schema: CashSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [CashsController],
  providers: [CashsService],
})
export class CashsModule {}
