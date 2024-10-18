import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AWSDocument = HydratedDocument<Aws>;

@Schema({ timestamps: true })
export class Aws {
  @Prop()
  awsId: string;

  @Prop()
  fileName: string;

  @Prop()
  prefix: string;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0: inactive
}

export const AWSSchema = SchemaFactory.createForClass(Aws);
