import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModal: Model<User>) {}

  async login(loginDto: LoginDto) {
    try {
      const existAccount = await this.userModal.findOne({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (!existAccount)
        throw new BadRequestException({
          message: 'Email hoặc password không tồn tại',
        });

      const { password, ...data } = existAccount.toObject();

      return {
        status: HttpStatus.OK,
        message: 'Đăng nhập thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const existUser = await this.userModal.findOne({
        email: createUserDto.email,
      });

      if (existUser)
        throw new BadRequestException({
          message: 'Email đã tồn tại',
        });

      const userCreated = await this.userModal.create({ ...createUserDto });
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

  async findAll() {
    try {
      return await this.userModal
        .find()
        .select('-password')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.userModal.findById(id);
    } catch (error) {}
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
