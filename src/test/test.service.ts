import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Test } from 'src/schemas/tests.schema';
import { Model } from 'mongoose';

@Injectable()
export class TestService {
  constructor(@InjectModel(Test.name) private testModal: Model<Test>) {}
  create(createTestDto: CreateTestDto) {
    return 'This action adds a new test';
  }

  async findAll() {
    return await this.testModal.findOne();
  }

  async findOne(id: string) {
    const ex = await this.testModal.findOne();
    let test: any;
    if (!ex) {
      test = await this.testModal.create({
        value: id,
      });
    } else {
      test = await this.testModal.findByIdAndUpdate(
        ex._id,
        { value: id },
        { new: true },
      );
    }

    return test;
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
