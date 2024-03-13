import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rose } from 'src/schemas/roses.schema';
import { Model } from 'mongoose';

@Injectable()
export class RosesService {
  constructor(@InjectModel(Rose.name) private roseModal: Model<Rose>) {}

  async findAll(req: any) {
    try {
      let query = {};

      query = {
        ...(req?.query?.reciveRoseId && {
          reciveRoseId: req.query.reciveRoseId,
        }),
      };

      return this.roseModal
        .find(query)
        .populate('reciveRoseId')
        .populate('introducedId')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }
}
