import { Injectable } from '@nestjs/common';
import { CreateUpgradeDto } from './dto/create-upgrade.dto';
import { UpdateUpgradeDto } from './dto/update-upgrade.dto';

@Injectable()
export class UpgradeService {
  create(createUpgradeDto: CreateUpgradeDto) {
    return 'This action adds a new upgrade';
  }

  findAll() {
    return `This action returns all upgrade`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upgrade`;
  }

  update(id: number, updateUpgradeDto: UpdateUpgradeDto) {
    return `This action updates a #${id} upgrade`;
  }

  remove(id: number) {
    return `This action removes a #${id} upgrade`;
  }
}
