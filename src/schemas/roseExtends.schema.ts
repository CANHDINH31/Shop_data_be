import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoseExtendDocument = HydratedDocument<RoseExtend>;

@Schema({ timestamps: true })
export class RoseExtend {
  @Prop({ default: 0 })
  level1: number;

  @Prop({ default: 0 })
  level2: number;

  @Prop({ default: 0 })
  level3: number;
}

export const RoseExtendSchema = SchemaFactory.createForClass(RoseExtend);
