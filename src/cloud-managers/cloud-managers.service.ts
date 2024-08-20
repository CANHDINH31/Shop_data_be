import { Injectable } from '@nestjs/common';
import { CreateCloudManagerDto } from './dto/create-cloud-manager.dto';
import { UpdateCloudManagerDto } from './dto/update-cloud-manager.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CloudManager } from 'src/schemas/cloudManagers.schema';
import { Model } from 'mongoose';

@Injectable()
export class CloudManagersService {
  constructor(
    @InjectModel(CloudManager.name)
    private cloudManagerModal: Model<CloudManager>,
  ) {}

  async create(createCloudManagerDto: CreateCloudManagerDto) {
    try {
      return await this.cloudManagerModal.create({ ...createCloudManagerDto });
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.cloudManagerModal.find({ isDelete: 1 });
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudManager`;
  }

  update(id: number, updateCloudManagerDto: UpdateCloudManagerDto) {
    return `This action updates a #${id} cloudManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudManager`;
  }
}
