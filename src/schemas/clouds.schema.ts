import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CloudDocument = HydratedDocument<Cloud>;

@Schema({ timestamps: true })
export class Cloud {
  @Prop()
  status: number;
  // 1:live - 0:die

  @Prop()
  name: string;

  @Prop()
  valid: number;
  // 1:valid - 0:expried

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  provider: string;

  @Prop()
  cloud: string;

  @Prop()
  key: string;

  @Prop()
  server: string;

  @Prop()
  price: number;

  @Prop()
  remark: string;
}

export const CloudSchema = SchemaFactory.createForClass(Cloud);
