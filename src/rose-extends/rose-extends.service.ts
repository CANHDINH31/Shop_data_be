import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { RoseExtend } from 'src/schemas/roseExtends.schema';
import { Model } from 'mongoose';
import { SyncRoseExtendDto } from './dto/sync-rose-extend.dto';

@Injectable()
export class RoseExtendsService {
  constructor(
    @InjectModel(RoseExtend.name) private roseExtendModal: Model<RoseExtend>,
    private configService: ConfigService,
  ) {}

  async createDefaultRoseExtend() {
    try {
      const commision = await this.roseExtendModal.findOne();
      if (commision) return;

      await this.roseExtendModal.create({
        level1: this.configService.get('ROSE_EXTEND_1'),
        level2: this.configService.get('ROSE_EXTEND_2'),
        level3: this.configService.get('ROSE_EXTEND_3'),
      });
    } catch (error) {
      throw error;
    }
  }

  async sync(syncRoseExtendDto: SyncRoseExtendDto) {
    const roseExtend = await this.roseExtendModal.findOne({});
    if (roseExtend) {
      await this.roseExtendModal.findByIdAndUpdate(
        roseExtend._id,
        syncRoseExtendDto,
      );
    } else {
      await this.roseExtendModal.create(syncRoseExtendDto);
    }

    return {
      status: HttpStatus.CREATED,
      message: 'thành công ',
    };
  }

  async find() {
    try {
      return await this.roseExtendModal.findOne();
    } catch (error) {
      throw error;
    }
  }
}
