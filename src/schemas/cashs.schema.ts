import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CashDocument = HydratedDocument<Cash>;

@Schema({ timestamps: true })
export class Cash {
  @Prop()
  code: string;

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
  type: number;
  // 0:auto-banking 1:manual

  @Prop()
  description: string;

  @Prop({ default: 0 })
  createByAdmin: number;
  // 0:false - 1:true
}

export const CashSchema = SchemaFactory.createForClass(Cash);
