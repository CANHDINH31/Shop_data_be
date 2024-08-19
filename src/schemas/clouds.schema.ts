import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CloudDocument = HydratedDocument<Cloud>;

@Schema({ timestamps: true })
export class Cloud {
  @Prop()
  name: string;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0:disactive
}

export const CloudSchema = SchemaFactory.createForClass(Cloud);
