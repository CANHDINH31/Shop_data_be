import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type extendPlanDocument = HydratedDocument<extendPlan>;

@Schema({ timestamps: true })
export class extendPlan {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  bandWidth: number;
  // unit: GB
}

export const extendPlanSchema = SchemaFactory.createForClass(extendPlan);
