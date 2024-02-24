import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateExtendPlanDto } from './dto/create-extend-plan.dto';
import { UpdateExtendPlanDto } from './dto/update-extend-plan.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ExtendPlan } from 'src/schemas/extendPlans.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExtendPlansService {
  constructor(
    @InjectModel(ExtendPlan.name) private extendPlanModal: Model<ExtendPlan>,
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

  async findAll() {
    try {
      return await this.extendPlanModal.find().sort({ createdAt: -1 });
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
      await this.extendPlanModal.deleteOne({ _id: id });
      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
