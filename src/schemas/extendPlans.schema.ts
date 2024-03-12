import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type extendPlanDocument = HydratedDocument<ExtendPlan>;

@Schema({ timestamps: true })
export class ExtendPlan {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  bandWidth: number;
  // unit: GB

  @Prop({ default: 1 })
  status: number;
}

export const ExtendPlanSchema = SchemaFactory.createForClass(ExtendPlan);
