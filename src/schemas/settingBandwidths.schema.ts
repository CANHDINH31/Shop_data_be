import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingBandwidthDocument = HydratedDocument<SettingBandwidth>;

@Schema({ timestamps: true })
export class SettingBandwidth {
  @Prop({ default: 0 })
  value: number;
}

export const SettingBandwidthSchema =
  SchemaFactory.createForClass(SettingBandwidth);
