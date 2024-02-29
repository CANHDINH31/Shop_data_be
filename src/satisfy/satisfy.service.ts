import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Cash } from 'src/schemas/cashs.schema';
import { Rose } from 'src/schemas/roses.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class SatisfyService {
  constructor(
    @InjectModel(Cash.name) private cashModal: Model<Cash>,
    @InjectModel(Rose.name) private roseModal: Model<Rose>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(User.name) private userModal: Model<User>,
  ) {}
  async findOne(id: string) {
    try {
      const cash = await this.cashModal.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(id), approve: 1 } },
        { $group: { _id: id, money: { $sum: '$money' } } },
      ]);

      const rose = await this.roseModal.aggregate([
        { $match: { reciveRoseId: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: id, money: { $sum: '$recive' } } },
      ]);

      const transaction = await this.transactionModal.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: id, money: { $sum: '$money' } } },
      ]);

      const user = await this.userModal.findById(id);
      const introduceUser = await this.userModal.find({ introduceCode: id });

      return {
        cash,
        rose,
        transaction,
        currentMoney: user?.money,
        numberIntoduce: introduceUser?.length,
      };
    } catch (error) {
      throw error;
    }
  }
}
