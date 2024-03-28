import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GistDocument = HydratedDocument<Gist>;

@Schema({ timestamps: true })
export class Gist {
  @Prop()
  code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
  planId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Key' })
  keyId: string;

  @Prop()
  extension: string;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0: inactive

  @Prop({ default: () => new Date() })
  createDate: Date;
}

export const GistSchema = SchemaFactory.createForClass(Gist);
