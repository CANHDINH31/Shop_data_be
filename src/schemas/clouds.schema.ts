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
  fileName: string;
}

export const CloudSchema = SchemaFactory.createForClass(Cloud);
