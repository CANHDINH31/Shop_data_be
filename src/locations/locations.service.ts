import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from 'src/schemas/locations.schema';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModal: Model<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    try {
      const data = await this.locationModal.create(createLocationDto);
      return { message: 'Tạo location thành công', data };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return this.locationModal.find();
    } catch (err) {
      throw err;
    }
  }

  async findOne(id: string) {
    try {
      return await this.locationModal.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    try {
      const data = await this.locationModal.findByIdAndUpdate(
        id,
        updateLocationDto,
        { new: true },
      );

      return {
        messgae: 'Cập nhật thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.locationModal.findByIdAndDelete(id);
      return { message: 'Xoá location thành công' };
    } catch (error) {
      throw error;
    }
  }
}
