import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommisionDocument = HydratedDocument<Commision>;

@Schema({ timestamps: true })
export class Commision {
  @Prop({ default: 0 })
  value: number;

  @Prop({ default: 0 })
  min: number;
}

export const CommisionSchema = SchemaFactory.createForClass(Commision);
