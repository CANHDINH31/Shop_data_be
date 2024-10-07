import { RejectCashDto } from './dto/reject-cash.dto';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCashDto } from './dto/create-cash.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cash } from 'src/schemas/cashs.schema';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import * as moment from 'moment';
import { generateRandomString } from 'src/utils';
import { CashByAdminDto } from './dto/cash-by-admin.dto';

@Injectable()
export class CashsService {
  constructor(
    @InjectModel(Cash.name) private cashModal: Model<Cash>,
    @InjectModel(User.name) private userModal: Model<User>,
  ) {}

  async autoBank(createCashDto: CreateCashDto) {
    try {
      const code = `${moment().format('YYYYMMDD')}-${generateRandomString(
        4,
      ).toLowerCase()}`;

      await this.cashModal.create({ ...createCashDto, code, status: 1 });

      await this.userModal.findByIdAndUpdate(createCashDto.userId, {
        $inc: { money: createCashDto.money },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Nạp tiền thành công.',
      };
    } catch (error) {
      throw error;
    }
  }

  async create(createCashDto: CreateCashDto) {
    try {
      const code = `${moment().format('YYYYMMDD')}-${generateRandomString(
        4,
      ).toLowerCase()}`;

      const data = await this.cashModal.create({ ...createCashDto, code });

      return {
        status: HttpStatus.CREATED,
        message: 'Nạp tiền thành công. Vui lòng chờ admin phê duyệt',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async cashByAdmin(cashByAdminDto: CashByAdminDto) {
    try {
      const code = `${moment().format('YYYYMMDD')}-${generateRandomString(
        4,
      ).toLowerCase()}`;

      const data = await this.cashModal.create({
        ...cashByAdminDto,
        code,
        status: 1,
        type: 1,
        createByAdmin: 1,
      });

      await this.userModal.findByIdAndUpdate(cashByAdminDto.userId, {
        $inc: { money: cashByAdminDto.money },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Nạp tiền thành công.',
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
        ...(req?.query?.userId && {
          userId: req.query.userId,
        }),
        ...(req?.query?.status && {
          status: req.query.status,
        }),
        ...(req?.query?.code && {
          code: { $regex: req.query.code, $options: 'i' },
        }),
      };

      return await this.cashModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('userId');
    } catch (error) {
      throw error;
    }
  }

  async approve(id: string) {
    try {
      const cash = await this.cashModal.findOne({ _id: id });

      if (cash.status !== 2)
        throw new BadRequestException({
          message: 'Hóa đơn đã được phê duyệt hoặc từ chối',
        });

      await this.cashModal.findByIdAndUpdate(cash._id, { status: 1 });

      await this.userModal.findByIdAndUpdate(cash.userId, {
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

  async reject(id: string, rejectCashDto: RejectCashDto) {
    try {
      const cash = await this.cashModal.findOne({ _id: id });

      if (cash.status !== 2)
        throw new BadRequestException({
          message: 'Hóa đơn đã được phê duyệt hoặc từ chối',
        });

      await this.cashModal.findByIdAndUpdate(cash._id, {
        status: 0,
        ...rejectCashDto,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Hóa đơn đã bị từ chối',
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} cash`;
  }
}
