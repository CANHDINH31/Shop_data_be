import { Injectable } from '@nestjs/common';
import { UpdateKumaDto } from './dto/update-kuma.dto';

@Injectable()
export class KumaService {
  create(createKumaDto) {
    console.log(createKumaDto, 'kumathong');
    return 'This action adds a new kuma';
  }

  findAll() {
    return `This action returns all kuma`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kuma`;
  }

  update(id: number, updateKumaDto: UpdateKumaDto) {
    return `This action updates a #${id} kuma`;
  }

  remove(id: number) {
    return `This action removes a #${id} kuma`;
  }
}
