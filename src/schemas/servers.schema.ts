import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ServerDocument = HydratedDocument<Server>;

@Schema({ timestamps: true })
export class Server {
  @Prop()
  serverId: string;

  @Prop({ default: '' })
  location: string;

  @Prop()
  apiUrl: string;

  @Prop()
  fingerPrint: string;

  @Prop()
  name: string;

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

  @Prop({ default: 6000000000000 })
  totalBandWidth: number;

  @Prop()
  deleteAt: Date;

  @Prop({ default: 1 })
  status: number;
  // 0:delete - 1:active - 2:down - 3:maintaince

  @Prop()
  remark: string;

  @Prop({ default: 0 })
  maxUsage: number;

  @Prop({ default: 0 })
  dataTransfer: number;

  @Prop({ default: 0 })
  isConnectKuma: number;
  // 0: not connect - 1: connect

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CloudManager' })
  cloudManagerId: string;

  @Prop({})
  monitorId: string[];
}

export const ServerSchema = SchemaFactory.createForClass(Server);
