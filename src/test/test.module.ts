import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { Test, TestSchema } from 'src/schemas/tests.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
  ],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
