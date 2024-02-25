import { Injectable } from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Key } from 'src/schemas/keys.schema';
import { Model } from 'mongoose';

@Injectable()
export class KeysService {
  constructor(@InjectModel(Key.name) private keyModal: Model<Key>) {}

  create(createKeyDto: CreateKeyDto) {
    return 'This action adds a new key';
  }

  async findAll(req: any) {
    try {
      let query = {};

      query = {
        ...(req?.query?.serverId && {
          serverId: req.query.serverId,
        }),

        ...(req?.query?.account && {
          account: { $regex: req.query.account, $options: 'i' },
        }),

        status: 1,
      };

      return await this.keyModal
        .find(query)
        .populate('userId')
        .populate('serverId');
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} key`;
  }

  update(id: number, updateKeyDto: UpdateKeyDto) {
    return `This action updates a #${id} key`;
  }

  remove(id: number) {
    return `This action removes a #${id} key`;
  }
}
