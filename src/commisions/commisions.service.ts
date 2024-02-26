import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Commision } from 'src/schemas/commisions.schema';
import { Model } from 'mongoose';
import { SyncCommisionDto } from './dto/sync-commision.dto';

@Injectable()
export class CommisionsService {
  constructor(
    @InjectModel(Commision.name) private commisionModal: Model<Commision>,
    private configService: ConfigService,
  ) {}

  async createDefaultCommision() {
    try {
      const commision = await this.commisionModal.findOne();
      if (commision) return;

      await this.commisionModal.create({
        value: this.configService.get('COMMISION'),
      });
    } catch (error) {
      throw error;
    }
  }

  async sync(syncCommisionDto: SyncCommisionDto) {
    const commision = await this.commisionModal.findOne({});
    if (commision) {
      await this.commisionModal.findByIdAndUpdate(
        commision._id,
        syncCommisionDto,
      );
    } else {
      await this.commisionModal.create(syncCommisionDto);
    }

    return {
      status: HttpStatus.CREATED,
      message: 'thành công ',
    };
  }

  async find() {
    try {
      return await this.commisionModal.findOne();
    } catch (error) {
      throw error;
    }
  }
}
