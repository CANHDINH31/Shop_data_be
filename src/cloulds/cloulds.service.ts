import { Injectable } from '@nestjs/common';
import { CreateClouldDto } from './dto/create-clould.dto';
import { UpdateClouldDto } from './dto/update-clould.dto';

@Injectable()
export class ClouldsService {
  create(createClouldDto: CreateClouldDto) {
    return 'This action adds a new clould';
  }

  findAll() {
    return `This action returns all cloulds`;
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
