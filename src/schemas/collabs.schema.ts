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

  @Prop({ default: 0 })
  minLevel1: number;

  @Prop({ default: 0 })
  minLevel2: number;

  @Prop({ default: 0 })
  minLevel3: 0;
}

export const CollabSchema = SchemaFactory.createForClass(Collab);
