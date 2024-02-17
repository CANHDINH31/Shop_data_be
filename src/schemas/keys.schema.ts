import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KeyDocument = HydratedDocument<Key>;

@Schema({ timestamps: true })
export class Key {
  @Prop()
  keyId: string;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop()
  port: number;

  @Prop()
  method: string;

  @Prop()
  accessUrl: string;
}

export const KeySchema = SchemaFactory.createForClass(Key);
