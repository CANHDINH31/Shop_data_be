import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Test } from 'src/schemas/tests.schema';

// Interface cho Active document
export interface Active {
  active: number;
}

@Injectable()
export class ConfigDatabaseService {
  constructor(@InjectModel('Test') private activeModel: Model<Test>) {}

  async isActive() {
    let test: any;
    test = await this.activeModel.findOne();
    if (!test) {
      await this.activeModel.create({ value: '0' });
      test = await this.activeModel.findOne();
    }
    return test;
  }
}
