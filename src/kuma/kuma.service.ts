import { Injectable } from '@nestjs/common';
import { UpdateKumaDto } from './dto/update-kuma.dto';

type KumaBody = {
  hostname: string;
  port: string;
  msg: string;
};

@Injectable()
export class KumaService {
  extractInfo(data: KumaBody) {
    const msgPattern = /^\[([cm][^\]]*)\] \[(🔴|✅) (Down|Up)\]/;
    const match = data.msg.match(msgPattern);

    if (match) {
      const status = match[3];
      return {
        hostname: data.hostname,
        status: status,
      };
    } else {
      return null;
    }
  }

  monitor(monitorKumaDto: any) {
    const kumaBody = {
      hostname: monitorKumaDto?.monitor?.hostname,
      port: monitorKumaDto?.monitor?.port,
      msg: monitorKumaDto?.msg,
    };

    const result = this.extractInfo(kumaBody);

    if (result) {
      console.log(result, 'kumathong');
      // UPDATE SERVER STATUS
    } else {
    }

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
