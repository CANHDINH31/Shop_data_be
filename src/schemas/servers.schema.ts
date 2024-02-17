import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServerDocument = HydratedDocument<Server>;

@Schema({ timestamps: true })
export class Server {
  @Prop()
  apiUrl: string;

  @Prop()
  fingerPrint: string;

  @Prop()
  name: string;

  @Prop()
  serverId: string;

  @Prop()
  metricsEnabled: boolean;

  @Prop()
  createdTimestampMs: number;

  @Prop()
  version: string;

  @Prop()
  portForNewAccessKeys: number;

  @Prop()
  hostnameForAccessKeys: string;
}

export const ServerSchema = SchemaFactory.createForClass(Server);
