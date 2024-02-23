import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CashDocument = HydratedDocument<Cash>;

@Schema({ timestamps: true })
export class Cash {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  money: number;

  @Prop({ default: false })
  approve: boolean;
}

export const CashSchema = SchemaFactory.createForClass(Cash);
