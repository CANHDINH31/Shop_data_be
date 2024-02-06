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
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
