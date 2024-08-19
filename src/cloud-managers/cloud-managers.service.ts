import { Injectable } from '@nestjs/common';
import { CreateCloudManagerDto } from './dto/create-cloud-manager.dto';
import { UpdateCloudManagerDto } from './dto/update-cloud-manager.dto';

@Injectable()
export class CloudManagersService {
  create(createCloudManagerDto: CreateCloudManagerDto) {
    return 'This action adds a new cloudManager';
  }

  findAll() {
    return `This action returns all cloudManagers`;
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
