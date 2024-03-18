import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateExtendPlanDto } from './dto/create-extend-plan.dto';
import { UpdateExtendPlanDto } from './dto/update-extend-plan.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ExtendPlan } from 'src/schemas/extendPlans.schema';
import { Model } from 'mongoose';
import { Transaction } from 'src/schemas/transactions.schema';

@Injectable()
export class ExtendPlansService {
  constructor(
    @InjectModel(ExtendPlan.name) private extendPlanModal: Model<ExtendPlan>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
  ) {}

  async create(createExtendPlanDto: CreateExtendPlanDto) {
    try {
      const data = await this.extendPlanModal.create({
        ...createExtendPlanDto,
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới extend plan thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: any) {
    try {
      let query = {};
      query = {
        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),
        ...(req?.query?.status && {
          status: req.query.status,
        }),
      };

      const listResult = [];

      const listExtendPlan = await this.extendPlanModal
        .find(query)
        .sort({ createdAt: -1 });

      for (const extendPlan of listExtendPlan) {
        const numberPurchase = await this.transactionModal.countDocuments({
          extendPlanId: extendPlan._id,
        });

        listResult.push({ ...extendPlan.toObject(), numberPurchase });
      }

      return listResult;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.extendPlanModal.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateExtendPlanDto: UpdateExtendPlanDto) {
    try {
      const data = await this.extendPlanModal.findByIdAndUpdate(
        id,
        updateExtendPlanDto,
        {
          new: true,
        },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật thông tin thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.extendPlanModal.findByIdAndUpdate(id, { status: 0 });
      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
