import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoseDocument = HydratedDocument<Rose>;

@Schema({ timestamps: true })
export class Rose {
  @Prop()
  code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reciveRoseId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  introducedId: string;

  @Prop()
  plan: string;

  @Prop()
  price: number;

  @Prop()
  percent: number;

  @Prop()
  recive: number;
}

export const RoseSchema = SchemaFactory.createForClass(Rose);
