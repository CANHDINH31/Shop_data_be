import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cash } from 'src/schemas/cashs.schema';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class CashsService {
  constructor(
    @InjectModel(Cash.name) private cashModal: Model<Cash>,
    @InjectModel(User.name) private userModal: Model<User>,
  ) {}

  async create(createCashDto: CreateCashDto) {
    try {
      await this.cashModal.create(createCashDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Nạp tiền thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: any) {
    try {
      let query = {};
      query = {
        ...(req?.query?.userId && {
          userId: req.query.userId,
        }),
        ...(req?.query?.approve && {
          approve: req.query.approve,
        }),
      };

      return await this.cashModal.find(query).populate('userId');
    } catch (error) {
      throw error;
    }
  }

  async approve(id: string) {
    try {
      const cash = await this.cashModal.findOne({ _id: id });
      if (cash.approve)
        throw new BadRequestException({
          message: 'Hóa đơn đã được phê duyệt',
        });

      const user = await this.userModal.findOne({ _id: cash.userId });

      await this.cashModal.findByIdAndUpdate(cash._id, { approve: true });

      await this.userModal.findByIdAndUpdate(user._id, {
        $inc: { money: cash.money },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Phê duyệt hóa đơn thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateCashDto: UpdateCashDto) {
    return `This action updates a #${id} cash`;
  }

  remove(id: number) {
    return `This action removes a #${id} cash`;
  }
}
