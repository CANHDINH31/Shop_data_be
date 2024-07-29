import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CashDocument = HydratedDocument<Cash>;

@Schema({ timestamps: true })
export class Cash {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  money: number;

  @Prop()
  content: string;

  @Prop({ default: 2 })
  status: number;
  // 2:pending 1:approve 0:reject

  @Prop()
  description: string;
}

export const CashSchema = SchemaFactory.createForClass(Cash);
