import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  email: string;

  @Prop()
  password: string;

  // 1: admin  2: user
  @Prop({ default: 2 })
  role: number;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  country: string;

  @Prop()
  job: string;

  @Prop({ default: 3 })
  purpose: number;
  /*Type of purpose
  0. Access global internet from China
  1. Access global internet from Iran
  2. Play Gaming
  3. Others
  */

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  introduceCode: string;

  @Prop({ default: 0 })
  money: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
