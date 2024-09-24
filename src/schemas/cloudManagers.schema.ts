import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CloudManagerDocument = HydratedDocument<CloudManager>;

@Schema({ timestamps: true })
export class CloudManager {
  @Prop()
  name: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  dieDate: Date;

  @Prop({ default: 1 })
  status: number;
  // 1:live - 0:die

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cloud' })
  cloudId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' })
  providerId: string;

  @Prop()
  key: string;

  @Prop()
  price: number;

  @Prop()
  remark: string;

  @Prop({ default: 1 })
  isDelete: number;
  // 1:not delete - 0:delete
}

export const CloudManagerSchema = SchemaFactory.createForClass(CloudManager);
