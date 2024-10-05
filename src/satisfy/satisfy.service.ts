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
import { GetByYearDto } from './dto/getByYear.dto';
import { Server } from 'src/schemas/servers.schema';
import { Key } from 'src/schemas/keys.schema';
import { GetTopUserByMonthDto } from './dto/GetTopUserByMonth.dto';
import { ExpiredKeyDto } from './dto/expiredKey.dto';

@Injectable()
export class SatisfyService {
  constructor(
    @InjectModel(Cash.name) private cashModal: Model<Cash>,
    @InjectModel(Rose.name) private roseModal: Model<Rose>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
  ) {}

  async server() {
    try {
      const amountTotalServer = await this.serverModal.countDocuments();
      const amountActiveServer = await this.serverModal.countDocuments({
        status: 1,
      });
      const amountKeyActive = await this.keyModal.countDocuments({ status: 1 });
      const amountRemovedServer = await this.serverModal.countDocuments({
        status: 0,
      });
      const getInfotimeServer = await this.serverModal.aggregate([
        { $match: { status: { $in: [0, 1, 2, 3] } } },
        {
          $group: {
            _id: 'time',
            createdAt: { $sum: { $toLong: '$createdAt' } },
            updatedAt: { $sum: { $toLong: '$updatedAt' } },
          },
        },
      ]);
      const totalTime =
        getInfotimeServer?.[0]?.updatedAt - getInfotimeServer?.[0]?.createdAt;

      const day = totalTime / (1000 * 60 * 60 * 24);
      return {
        amountTotalServer,
        amountActiveServer,
        amountKeyActive,
        averageServerLive: day / amountRemovedServer,
      };
    } catch (error) {
      throw error;
    }
  }

  async topPlan() {
    try {
      const transaction = await this.transactionModal.aggregate([
        {
          $group: {
            _id: '$planId',
            count: { $sum: 1 },
            totalMoney: { $sum: '$money' },
          },
        },
        {
          $lookup: {
            from: 'plans',
            let: { planId: '$_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$planId'] } } }],
            as: 'plan',
          },
        },
        {
          $match: {
            'plan.price': { $gt: 0 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async expiredKey(expiredKeyDto: ExpiredKeyDto) {
    try {
      const yesterday = moment(expiredKeyDto.day)
        .subtract(1, 'days')
        .format('YYYY-MM-DD hh:mm');
      const tomorrow = moment(expiredKeyDto.day)
        .add(1, 'days')
        .format('YYYY-MM-DD hh:mm');

      const key = await this.keyModal.aggregate([
        {
          $match: {
            status: 1,
            endDate: {
              $gt: new Date(yesterday),
              $lt: new Date(tomorrow),
            },
          },
        },
        {
          $lookup: {
            from: 'servers',
            localField: 'serverId',
            foreignField: '_id',
            as: 'server',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'aws',
            localField: 'awsId',
            foreignField: '_id',
            as: 'aws',
          },
        },
      ]);
      return key;
    } catch (error) {
      throw error;
    }
  }

  async getTopUserByMonth(getTopUserByMonthDto: GetTopUserByMonthDto) {
    try {
      const startOfMonth = moment(getTopUserByMonthDto.month)
        .startOf('month')
        .format('YYYY-MM-DD hh:mm');
      const endOfMonth = moment(getTopUserByMonthDto.month)
        .endOf('month')
        .format('YYYY-MM-DD hh:mm');

      const cash = await this.cashModal.aggregate([
        {
          $match: {
            status: 1,
            createdAt: {
              $gte: new Date(startOfMonth),
              $lte: new Date(endOfMonth),
            },
          },
        },
        {
          $group: {
            _id: '$userId',
            totalMoney: { $sum: '$money' },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } }],
            as: 'user',
          },
        },
        { $sort: { totalMoney: -1 } },
        { $limit: 10 },
      ]);

      return cash;
    } catch (error) {
      throw error;
    }
  }

  async getTopUser() {
    try {
      const cash = await this.cashModal.aggregate([
        {
          $match: {
            status: 1,
          },
        },
        {
          $group: {
            _id: '$userId',
            totalMoney: { $sum: '$money' },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } }],
            as: 'user',
          },
        },
        { $sort: { totalMoney: -1 } },
        { $limit: 10 },
      ]);

      return cash;
    } catch (error) {
      throw error;
    }
  }

  async newUserToday() {
    try {
      try {
        const yesterday = moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD hh:mm');
        const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD hh:mm');

        const users = await this.userModal.aggregate([
          {
            $match: {
              createdAt: {
                $gt: new Date(yesterday),
                $lt: new Date(tomorrow),
              },
            },
          },
        ]);
        return users;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async buyPlanToday() {
    try {
      try {
        const yesterday = moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD hh:mm');
        const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD hh:mm');

        const transactions = await this.transactionModal.aggregate([
          {
            $match: {
              createdAt: {
                $gt: new Date(yesterday),
                $lt: new Date(tomorrow),
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $lookup: {
              from: 'plans',
              localField: 'planId',
              foreignField: '_id',
              as: 'plan',
            },
          },
          {
            $lookup: {
              from: 'gists',
              localField: 'gistId',
              foreignField: '_id',
              as: 'gist',
            },
          },
          {
            $lookup: {
              from: 'extendPlans',
              localField: 'extendPlanId',
              foreignField: '_id',
              as: 'extendPlan',
            },
          },
        ]);
        return transactions;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async fullDataToday() {
    try {
      try {
        const key = await this.keyModal.aggregate([
          {
            $match: {
              status: 1,
              $expr: { $gt: ['$dataUsage', '$dataExpand'] },
            },
          },
        ]);
        return key;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async newCashToday() {
    try {
      try {
        const yesterday = moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD hh:mm');
        const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD hh:mm');

        const cashs = await this.cashModal.aggregate([
          {
            $match: {
              status: 1,
              createdAt: {
                $gt: new Date(yesterday),
                $lt: new Date(tomorrow),
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
        ]);
        return cashs;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async getByLevel() {
    try {
      const cash = await this.cashModal.aggregate([
        {
          $match: {
            status: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $group: {
            _id: '$user.level',
            totalMoney: { $sum: '$money' },
          },
        },
        {
          $project: {
            _id: 1,
            totalMoney: 1,
            level: '$_id',
          },
        },
      ]);

      return cash;
    } catch (error) {
      throw error;
    }
  }

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

      const discount = await this.transactionModal.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(id) },
        },
        {
          $project: {
            adjustedMoney: {
              $multiply: [
                '$money',
                {
                  $divide: ['$discount', { $subtract: [100, '$discount'] }],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAdjustedMoney: { $sum: '$adjustedMoney' },
          },
        },
      ]);

      const user = await this.userModal.findById(id);
      const introduceUser = await this.userModal.find({ introduceCode: id });

      return {
        cash,
        rose,
        transaction,
        discount,
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
            status: 1,
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

  async getByYear(getByYearDto: GetByYearDto) {
    try {
      const listResult = [];
      for (let i = 1; i <= 12; i++) {
        const month = getByYearDto.year + '-' + i;
        const startOfMonth = moment(month)
          .startOf('month')
          .format('YYYY-MM-DD hh:mm');
        const endOfMonth = moment(month)
          .endOf('month')
          .format('YYYY-MM-DD hh:mm');
        const cash = await this.cashModal.aggregate([
          {
            $match: {
              status: 1,
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

        listResult.push({ month: i, cash, rose, transaction });
      }
      return listResult;
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
