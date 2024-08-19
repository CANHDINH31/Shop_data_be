import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProviderDocument = HydratedDocument<Provider>;

@Schema({ timestamps: true })
export class Provider {
  @Prop()
  name: string;

  @Prop({ default: 1 })
  status: number;
  // 1:active - 0:disactive
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);
