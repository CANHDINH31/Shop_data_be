import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GistDocument = HydratedDocument<Gist>;

@Schema({ timestamps: true })
export class Gist {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  gistId: string;

  @Prop()
  fileName: string;

  @Prop()
  serverId: string;

  @Prop()
  keyId: string;

  @Prop()
  extension: string;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0: inactive
}

export const GistSchema = SchemaFactory.createForClass(Gist);
