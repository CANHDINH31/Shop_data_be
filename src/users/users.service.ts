import { ForgotPasswordDto } from './dto/forgot-password';
import { ResetPasswordDto } from './dto/reset-password.dto';
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
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nest-modules/mailer';
import { generateRandomString } from 'src/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Cash.name) private cashModal: Model<Cash>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailerService: MailerService,
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
          message: 'Tài khoản hoặc email đã tồn tại',
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
        introduceCode: generateRandomString(7),
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
        ...(req?.query?.level && {
          level: { $in: req.query.level?.split(',') },
        }),
        ...(req?.query?.email && {
          email: { $regex: req.query.email, $options: 'i' },
        }),
        ...(req?.query?.username && {
          username: { $regex: req.query.username, $options: 'i' },
        }),
        ...(req?.query?.introduceCode && {
          introduceCode: { $regex: req.query.introduceCode, $options: 'i' },
        }),
      };

      const pageSize = req.query.pageSize || 10;
      const page = req.query.page || 1;
      const skip = Number(pageSize) * (page - 1);
      const take = Number(pageSize);

      const listUser = await this.userModal
        .find(query)
        .populate('introduceUserId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take);

      const totalItems = await this.userModal.find(query).count();

      const totalPage = Math.ceil(totalItems / Number(pageSize));

      const resultList = [];

      for (const user of listUser) {
        const transaction = await this.transactionModal.find({
          userId: user._id,
        });

        const cash = await this.cashModal.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user._id),
              status: 1,
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

      return {
        currentPage: Number(page),
        totalPage,
        itemsPerPage: Number(take),
        totalItems,
        resultList,
      };
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

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const decode = await this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      await this.userModal.findByIdAndUpdate(decode._id, {
        password: resetPasswordDto.newPassword,
      });

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật mật khẩu thành công',
      };
    } catch (error) {
      throw new BadRequestException(
        'Hết thời gian thay đổi mật khẩu hoặc token chưa chính xác',
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userModal.findOne({
        email: forgotPasswordDto.email,
      });

      if (!user)
        throw new BadRequestException({
          message: 'User không tồn tại',
        });

      const { password, ...data } = user.toObject();

      const token = await this.jwtService.signAsync(data, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '5m',
      });

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'VPNCN2 Reset Password',
        text: `${this.configService.get(
          'DOMAIN_WEB',
        )}/reset-password?token=${token}`,
      });

      return {
        status: HttpStatus.OK,
        message:
          'Vui lòng vào mail click vào link để đổi mật khẩu. Hạn đổi mật khẩu là 5 phút kể từ lúc nhận email',
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
}
