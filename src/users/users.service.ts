import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { LoginDto } from './dto/login.dto';
import { Transaction } from 'src/schemas/transactions.schema';
import { Cash } from 'src/schemas/cashs.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Cash.name) private cashModal: Model<Cash>,
    private configService: ConfigService,
  ) {}

  async createDefaultAdmin() {
    try {
      const existAdmin = await this.userModal.findOne({
        email: this.configService.get('ADMIN_EMAIL'),
      });

      if (existAdmin) return;

      await this.userModal.create({
        email: this.configService.get('ADMIN_EMAIL'),
        password: this.configService.get('ADMIN_PASSWORD'),
        username: this.configService.get('ADMIN_USERNAME'),
        role: 1,
      });
    } catch (error) {}
  }

  async login(loginDto: LoginDto) {
    try {
      const existAccount = await this.userModal.findOne({
        $or: [
          { email: loginDto.account, password: loginDto.password },
          { username: loginDto.account, password: loginDto.password },
        ],
      });

      if (!existAccount)
        throw new BadRequestException({
          message: 'Email / Username hoặc password không tồn tại',
        });

      return {
        status: HttpStatus.OK,
        message: 'Đăng nhập thành công',
        data: existAccount,
      };
    } catch (error) {
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Check exist user
      const existUser = await this.userModal.findOne({
        $or: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });

      if (existUser)
        throw new BadRequestException({
          message: 'Email hoặc password đã tồn tại',
        });

      // Check exist introduce code
      let existIntroduceCode = {} as any;
      if (createUserDto.introduceCode) {
        existIntroduceCode = await this.userModal.findOne({
          introduceCode: createUserDto.introduceCode,
        });

        if (!existIntroduceCode) {
          throw new BadRequestException({
            message: 'Mã giới thiệu chưa chính xác',
          });
        }
      }

      const userCreated = await this.userModal.create({
        ...createUserDto,
        ...(existIntroduceCode && { introduceUserId: existIntroduceCode?._id }),
        introduceCode: this.generateRandomString(7),
      });

      const { password, ...data } = userCreated.toObject();

      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới user thành công',
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
        ...(req?.query?.introduceCode && {
          introduceCode: req.query.introduceCode,
        }),
        ...(req?.query?.email && {
          email: { $regex: req.query.email, $options: 'i' },
        }),
      };

      const listUser = await this.userModal
        .find(query)
        .populate('introduceUserId')
        .sort({ createdAt: -1 });

      const resultList = [];

      for (const user of listUser) {
        const transaction = await this.transactionModal.find({
          userId: user._id,
        });

        const cash = await this.cashModal.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user._id),
              approve: true,
            },
          },
          { $group: { _id: user._id, money: { $sum: '$money' } } },
        ]);

        resultList.push({
          ...user.toObject(),
          transaction: transaction?.length,
          cash: cash?.[0]?.money,
        });
      }

      return resultList;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.userModal.findById(id).populate('introduceUserId');
    } catch (error) {
      throw error;
    }
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.userModal.findById(id);
      const isCorrectOldPassword =
        user.password === changePasswordDto.oldPassword;
      if (!isCorrectOldPassword) {
        throw new BadRequestException({
          message: 'Mật khẩu cũ không chính xác',
        });
      }

      const data = await this.userModal.findByIdAndUpdate(
        user._id,
        {
          password: changePasswordDto.newPassword,
        },
        { new: true },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật mật khẩu thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const data = await this.userModal.findByIdAndUpdate(id, updateUserDto, {
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
      await this.userModal.deleteOne({ _id: id });
      return {
        status: HttpStatus.OK,
        message: 'Xóa người dùng thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  generateRandomString(length) {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }
}
