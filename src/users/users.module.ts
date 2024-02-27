import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/users.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { Cash, CashSchema } from 'src/schemas/cashs.schema';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nest-modules/mailer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    MongooseModule.forFeature([{ name: Cash.name, schema: CashSchema }]),
  ],

  controllers: [UsersController],
  providers: [UsersService, JwtService],
})
export class UsersModule {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.usersService.createDefaultAdmin();
  }
}
