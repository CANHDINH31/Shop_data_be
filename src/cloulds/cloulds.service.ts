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
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} clould`;
  }

  update(id: number, updateClouldDto: UpdateClouldDto) {
    return `This action updates a #${id} clould`;
  }

  remove(id: number) {
    return `This action removes a #${id} clould`;
  }
}
