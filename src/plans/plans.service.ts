import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from 'src/schemas/plans.schema';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plan.name) private planModal: Model<Plan>) {}

  async create(createPlanDto: CreatePlanDto) {
    try {
      const data = await this.planModal.create({ ...createPlanDto });
      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới plan thành công',
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
          name: req.query.name,
        }),
      };

      return await this.planModal.find(query).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.planModal.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    try {
      const data = await this.planModal.findByIdAndUpdate(id, updatePlanDto, {
        new: true,
      });

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
      await this.planModal.deleteOne({ _id: id });
      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
