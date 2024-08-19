import { Injectable } from '@nestjs/common';
import { CreateClouldDto } from './dto/create-clould.dto';
import { UpdateClouldDto } from './dto/update-clould.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cloud } from 'src/schemas/clouds.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClouldsService {
  constructor(@InjectModel(Cloud.name) private cloudModal: Model<Cloud>) {}
  async create(createClouldDto: CreateClouldDto) {
    try {
      return await this.cloudModal.create({ ...createClouldDto });
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.cloudModal.find({ status: 1 });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.cloudModal.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateClouldDto: UpdateClouldDto) {
    try {
      return await this.cloudModal.findByIdAndUpdate(id, updateClouldDto, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.cloudModal.findByIdAndUpdate(id, { status: 0 });
    } catch (error) {
      throw error;
    }
  }
}
