import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SyncCollabDto } from './dto/sync-collab.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Collab } from 'src/schemas/collabs.schema';
import { Model } from 'mongoose';

@Injectable()
export class CollabService {
  constructor(
    @InjectModel(Collab.name) private collabModal: Model<Collab>,
    private configService: ConfigService,
  ) {}

  async createDefaulCollab() {
    try {
      const collab = await this.collabModal.findOne();
      if (collab) return;

      await this.collabModal.create({
        level1: this.configService.get('LEVEL1'),
        level2: this.configService.get('LEVEL2'),
        level3: this.configService.get('LEVEL3'),
      });
    } catch (error) {
      throw error;
    }
  }

  async sync(syncCollabDto: SyncCollabDto) {
    try {
      const collab = await this.collabModal.findOne({});
      if (collab) {
        await this.collabModal.findByIdAndUpdate(collab._id, syncCollabDto);
      } else {
        await this.collabModal.create(syncCollabDto);
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Đồng bộ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async find() {
    try {
      return await this.collabModal.findOne();
    } catch (error) {
      throw error;
    }
  }
}
