import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from 'src/schemas/transactions.schema';
import { Model } from 'mongoose';
import { HistoryExtendPlanTransactionDto } from './dto/history-extend-plan-transaction.dto';
import { Gist } from 'src/schemas/gists.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
  ) {}

  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  async historyExtendPlan(
    historyExtendPlanTransactionDto: HistoryExtendPlanTransactionDto,
  ) {
    const gist = await this.gistModal.findOne({
      keyId: historyExtendPlanTransactionDto.keyId,
    });

    return await this.transactionModal
      .find({ gistId: gist._id, extendPlanId: { $exists: true } })
      .sort({ createdAt: -1 })
      .populate('userId')
      .populate({
        path: 'gistId',
        populate: {
          path: 'keyId',
        },
      })
      .populate('extendPlanId');
  }

  async historyUpgradePlan(
    historyExtendPlanTransactionDto: HistoryExtendPlanTransactionDto,
  ) {
    const gist = await this.gistModal.findOne({
      keyId: historyExtendPlanTransactionDto.keyId,
    });

    return await this.transactionModal
      .find({
        gistId: gist._id,
        planId: { $exists: true },
        description: { $regex: 'Gia hạn', $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .populate('userId')
      .populate({
        path: 'gistId',
        populate: {
          path: 'keyId',
        },
      })
      .populate('planId');
  }

  async test() {
    const data: any = await this.transactionModal
      .find({
        planId: { $exists: true },
        description: { $regex: 'Gia hạn', $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .populate('userId')
      .populate({
        path: 'gistId',
        populate: {
          path: 'keyId',
        },
      })
      .populate('planId');

    return data;
  }

  async findAll(req: any) {
    try {
      let query = {};

      query = {
        ...(req?.query?.userId && {
          userId: req.query.userId,
        }),
      };

      return await this.transactionModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate({
          path: 'gistId',
          populate: {
            path: 'keyId',
          },
        })
        .populate('planId')
        .populate('extendPlanId');
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
