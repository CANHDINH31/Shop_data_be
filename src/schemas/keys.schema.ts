import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type KeyDocument = HydratedDocument<Key>;

@Schema({ timestamps: true })
export class Key {
  @Prop()
  keyId: string;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop()
  port: number;

  @Prop()
  method: string;

  @Prop()
  accessUrl: string;

  @Prop({ default: true })
  enable: boolean;

  @Prop({ default: true })
  enableByAdmin: boolean;

  @Prop({ default: 120000000000 })
  dataLimit: number;

  @Prop({ default: 0 })
  dataUsageYesterday: number;

  @Prop({ default: 0 })
  dataUsage: number;

  @Prop({ default: [] })
  arrayDataUsage: number[];

  @Prop({ default: 0 })
  dataExpand: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Server' })
  serverId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Aws' })
  awsId: string;

  @Prop()
  account: string;

  @Prop({ default: () => new Date() })
  startDate: Date;

  @Prop({ default: () => new Date() })
  endDate: Date;

  @Prop()
  endExpandDate: Date;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0: inactive -2:migrate

  @Prop({ default: () => new Date() })
  createDate: Date;

  @Prop()
  migrateDate: Date;

  @Prop({ default: 0 })
  counterMigrate: number;
}

export const KeySchema = SchemaFactory.createForClass(Key);
