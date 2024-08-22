import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlanDocument = HydratedDocument<Plan>;

@Schema({ timestamps: true })
export class Plan {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  type: string;

  @Prop()
  description: string[];

  @Prop()
  day: number;

  @Prop()
  bandWidth: number;
  // unit: GB

  @Prop({ default: 0 })
  display: number;

  @Prop({ default: 1 })
  status: number;

  @Prop({ defaul: 1 })
  enable: number;
  // 1:enable - 0: disable
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
