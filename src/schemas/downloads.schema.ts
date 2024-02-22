import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({ timestamps: true })
export class Download {
  @Prop()
  url: string;

  @Prop()
  device: string;
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
