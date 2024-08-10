import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  username: string;

  // 1:admin - 2:user - 3:moderator
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

  @Prop()
  introduceCode: string;
  // Mã giới thiệu

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  introduceUserId: string;
  // Người giới thiệu

  @Prop({ default: 0 })
  level: number;

  @Prop({ default: 0 })
  money: number;

  @Prop({ default: 0 })
  isFree: number;

  @Prop({ default: false })
  canMigrate: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
