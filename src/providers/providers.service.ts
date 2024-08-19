import { Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Model } from 'mongoose';
import { Provider } from 'src/schemas/providers.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectModel(Provider.name) private providerModal: Model<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto) {
    try {
      return await this.providerModal.create({ ...createProviderDto });
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await this.providerModal.find({ status: 1 });
  }

  async findOne(id: string) {
    try {
      return await this.providerModal.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateProviderDto: UpdateProviderDto) {
    try {
      return await this.providerModal.findByIdAndUpdate(id, updateProviderDto, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.providerModal.findByIdAndUpdate(id, { status: 0 });
    } catch (error) {
      throw error;
    }
  }
}
