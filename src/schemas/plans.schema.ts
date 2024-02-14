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
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
