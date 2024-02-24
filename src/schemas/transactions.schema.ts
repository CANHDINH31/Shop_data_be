import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Gist' })
  gistId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
  planId: string;

  @Prop()
  description: string;

  @Prop()
  money: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
