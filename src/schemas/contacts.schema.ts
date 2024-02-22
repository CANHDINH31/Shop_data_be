import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ timestamps: true })
export class Contact {
  @Prop()
  wechat: string;

  @Prop()
  zalo: string;

  @Prop()
  whatapp: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
