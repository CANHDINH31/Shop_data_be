import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CollabDocument = HydratedDocument<Collab>;

@Schema({ timestamps: true })
export class Collab {
  @Prop({ default: 0 })
  level1: number;

  @Prop({ default: 0 })
  level2: number;

  @Prop({ default: 0 })
  level3: number;
}

export const CollabSchema = SchemaFactory.createForClass(Collab);
