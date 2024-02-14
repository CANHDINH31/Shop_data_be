import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GistDocument = HydratedDocument<Gist>;

@Schema({ timestamps: true })
export class Gist {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
  planId: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  gistId: string;

  @Prop()
  fileName: string;
}

export const GistSchema = SchemaFactory.createForClass(Gist);
