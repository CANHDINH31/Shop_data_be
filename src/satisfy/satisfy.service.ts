import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Cash } from 'src/schemas/cashs.schema';
import { Rose } from 'src/schemas/roses.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { User } from 'src/schemas/users.schema';
import { CashDto } from './dto/cash.dto';
import * as moment from 'moment';
import { TransactionPlanDto } from './dto/transaction-plan.dto';
import { TransactionExtendPlanDto } from './dto/transaction-extend-plan.dto';
import { GetByMonthDto } from './dto/getByMonth.dto';

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
        { $match: { userId: new mongoose.Types.ObjectId(id), status: 1 } },
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

  async getByMonth(getByMonthDto: GetByMonthDto) {
    try {
      const startOfMonth = moment(getByMonthDto.month)
        .startOf('month')
        .format('YYYY-MM-DD hh:mm');
      const endOfMonth = moment(getByMonthDto.month)
        .endOf('month')
        .format('YYYY-MM-DD hh:mm');

      const cash = await this.cashModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startOfMonth),
              $lte: new Date(endOfMonth),
            },
          },
        },
        { $group: { _id: 'cash', money: { $sum: '$money' } } },
      ]);

      const rose = await this.roseModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startOfMonth),
              $lte: new Date(endOfMonth),
            },
          },
        },
        { $group: { _id: 'rose', money: { $sum: '$recive' } } },
      ]);

      const transaction = await this.transactionModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startOfMonth),
              $lte: new Date(endOfMonth),
            },
          },
        },
        { $group: { _id: 'transaction', money: { $sum: '$money' } } },
      ]);

      return {
        cash,
        rose,
        transaction,
      };
    } catch (error) {
      throw error;
    }
  }

  async cash(cashDto: CashDto) {
    try {
      const cash = await this.cashModal.aggregate([
        {
          $match: {
            status: 1,
            createdAt: {
              $gte: new Date(moment(cashDto.startDate).format('YYYY-MM-DD')),
              $lte: new Date(moment(cashDto.endDate).format('YYYY-MM-DD')),
            },
          },
        },
        { $group: { _id: 'cash', money: { $sum: '$money' } } },
      ]);
      return {
        cash,
      };
    } catch (error) {
      throw error;
    }
  }

  async transactionPlan(transactionPlanDto: TransactionPlanDto) {
    try {
      const transactionPlan = await this.transactionModal.aggregate([
        {
          $match: {
            planId: new mongoose.Types.ObjectId(transactionPlanDto.planId),
            createdAt: {
              $gte: new Date(
                moment(transactionPlanDto.startDate).format('YYYY-MM-DD'),
              ),
              $lte: new Date(
                moment(transactionPlanDto.endDate).format('YYYY-MM-DD'),
              ),
            },
          },
        },
        { $group: { _id: 'transaction-plan', money: { $sum: '$money' } } },
      ]);
      return {
        transactionPlan,
      };
    } catch (error) {
      throw error;
    }
  }

  async transactionExtendPlan(
    transactionExtendPlanDto: TransactionExtendPlanDto,
  ) {
    try {
      const transactionExtendPlan = await this.transactionModal.aggregate([
        {
          $match: {
            extendPlanId: new mongoose.Types.ObjectId(
              transactionExtendPlanDto.extendPlanId,
            ),
            createdAt: {
              $gte: new Date(
                moment(transactionExtendPlanDto.startDate).format('YYYY-MM-DD'),
              ),
              $lte: new Date(
                moment(transactionExtendPlanDto.endDate).format('YYYY-MM-DD'),
              ),
            },
          },
        },
        {
          $group: { _id: 'transaction-extend-plan', money: { $sum: '$money' } },
        },
      ]);
      return {
        transactionExtendPlan,
      };
    } catch (error) {
      throw error;
    }
  }
}
