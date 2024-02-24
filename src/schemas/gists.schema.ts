import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GistDocument = HydratedDocument<Gist>;

@Schema({ timestamps: true })
export class Gist {
  @Prop()
  gistId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Key' })
  keyId: string;

  @Prop()
  fileName: string;

  @Prop()
  extension: string;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0: inactive
}

export const GistSchema = SchemaFactory.createForClass(Gist);
