import { Injectable } from '@nestjs/common';
import { UpdateKumaDto } from './dto/update-kuma.dto';
import { CreateKumaDto } from './dto/create-kuma.dto';
import { ConfigService } from '@nestjs/config';
import { RemoveKumaDto } from './dto/remove-kuma.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Server } from 'src/schemas/servers.schema';
import { Key } from 'src/schemas/keys.schema';
import { Model } from 'mongoose';
import { KeysService } from 'src/keys/keys.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { HttpService } from '@nestjs/axios';

type KumaBody = {
  hostname: string;
  port: string;
  msg: string;
};

const DOWN = 'Down';

@Injectable()
export class KumaService {
  constructor(
    private configService: ConfigService,
    private readonly keyService: KeysService,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectQueue('kuma-monitor') private kumaMonitorQueue: Queue,
    private readonly httpService: HttpService,
  ) {}
  private extractInfo(data: KumaBody) {
    const msgPattern = /^\[([cm][^\]]*)\] \[(🔴|✅) (Down|Up)\]/;
    const match = data.msg.match(msgPattern);

    if (match) {
      const status = match[3];
      return {
        hostname: data.hostname,
        status: status,
      };
    } else {
      return null;
    }
  }

  async monitor(monitorKumaDto: any) {
    try {
      const kumaBody = {
        hostname: monitorKumaDto?.monitor?.hostname,
        port: monitorKumaDto?.monitor?.port,
        msg: monitorKumaDto?.msg,
      };

      const result = this.extractInfo(kumaBody);
      const amountQueueWating = await this.kumaMonitorQueue.count();
      if (amountQueueWating > 200) {
        await this.kumaMonitorQueue.clean(0, 100, 'wait');
      }
      await this.kumaMonitorQueue.add('kuma-monitor', {
        data: result,
      });

      return 'This action adds a new kuma';
    } catch (error) {
      console.log(error);
    }
  }

  async test() {
    try {
    } catch (error) {
      throw error;
    }
  }

  async _handleMonitorCore(result: any) {
    try {
      if (result && result.status === DOWN) {
        // { hostname: '139.59.108.224', status: 'Down' }
        // Update status down server
        const downServer = await this.serverModal.findOne({
          hostnameForAccessKeys: result.hostname,
        });
        if (downServer.status == 2) return;
        await this.serverModal.findOneAndUpdate(
          {
            hostnameForAccessKeys: result.hostname,
          },
          { status: 2 },
        );
        // Migrate key to maintain server
        let maintainServer;

        const serverSameLocation = await this.serverModal.findOne({
          status: 3,
          location: downServer.location,
        });

        if (serverSameLocation) {
          maintainServer = serverSameLocation;
        } else {
          const listServer = await this.serverModal.aggregate([
            {
              $match: {
                status: 3,
              },
            },
            {
              $lookup: {
                from: 'keys',
                localField: '_id',
                foreignField: 'serverId',
                as: 'keys',
                pipeline: [
                  {
                    $match: { status: 1 },
                  },
                ],
              },
            },
            {
              $addFields: {
                keyCount: { $size: '$keys' },
              },
            },
            {
              $sort: { keyCount: 1 },
            },
            {
              $limit: 1,
            },
          ]);

          maintainServer = listServer[0];
        }

        if (maintainServer) {
          const listKey = await this.keyModal.find({
            serverId: downServer?._id?.toString(),
            status: 1,
          });
          for (const key of listKey) {
            await this.keyService.migrate({
              keyId: key._id?.toString(),
              serverId: maintainServer?._id?.toString(),
            });
          }
        } else {
          console.log('not found maintain server');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async create(createKumaDto: CreateKumaDto) {
    const formData = new FormData();
    formData.append('username', this.configService.get('KUMA_USERNAME'));
    formData.append('password', this.configService.get('KUMA_PASSWORD'));
    try {
      const res = await this.httpService.axiosRef.post(
        this.configService.get('KUMA_DOMAIN') + '/login/access-token',
        formData,
      );

      const token = res.data.access_token;

      const payloadC = {
        type: 'port',
        name: `c-${createKumaDto.name}-${createKumaDto.hostname}`,
        interval: 30,
        retryInterval: 30,
        resendInterval: 0,
        maxretries: 6,
        upsideDown: false,
        url: 'https://',
        expiryNotification: false,
        ignoreTls: false,
        maxredirects: 10,
        port: createKumaDto.portC,
        accepted_statuscodes: ['200-299'],
        notificationIDList: [1, 2],
        method: 'GET',
        authMethod: 'basic',
        hostname: createKumaDto.hostname,
        dns_resolve_server: '1.1.1.1',
        dns_resolve_type: 'A',
        mqttUsername: '',
        mqttPassword: '',
      };

      const payloadP = {
        type: 'ping',
        name: `p-${createKumaDto.name}-${createKumaDto.hostname}`,
        interval: 30,
        retryInterval: 30,
        resendInterval: 0,
        maxretries: 6,
        upsideDown: false,
        url: 'https://',
        expiryNotification: false,
        ignoreTls: false,
        maxredirects: 10,
        accepted_statuscodes: ['200-299'],
        method: 'GET',
        authMethod: 'basic',
        hostname: createKumaDto.hostname,
        dns_resolve_server: '1.1.1.1',
        dns_resolve_type: 'A',
        mqttUsername: '',
        mqttPassword: '',
      };

      const monitorResC = await this.httpService.axiosRef.post(
        this.configService.get('KUMA_DOMAIN') + '/monitors',
        payloadC,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const monitorResP = await this.httpService.axiosRef.post(
        this.configService.get('KUMA_DOMAIN') + '/monitors',
        payloadP,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.serverModal.findOneAndUpdate(
        {
          hostnameForAccessKeys: createKumaDto.hostname,
          status: createKumaDto.status,
        },
        {
          monitorId: [monitorResC.data.monitorID, monitorResP.data.monitorID],
          isConnectKuma: 1,
        },
      );

      return 'create kuma monitor successfully';
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  findAll() {
    return `This action returns all kuma`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kuma`;
  }

  update(id: number, updateKumaDto: UpdateKumaDto) {
    return `This action updates a #${id} kuma`;
  }

  async remove(removeKumaDto: RemoveKumaDto) {
    try {
      const server: any = await this.serverModal.findById(removeKumaDto.id);
      const listMonitorId = server.monitorId;
      const formData = new FormData();
      formData.append('username', this.configService.get('KUMA_USERNAME'));
      formData.append('password', this.configService.get('KUMA_PASSWORD'));

      const res = await this.httpService.axiosRef.post(
        this.configService.get('KUMA_DOMAIN') + '/login/access-token',
        formData,
      );

      const token = res.data.access_token;

      await this.httpService.axiosRef.delete(
        this.configService.get('KUMA_DOMAIN') + `/monitors/${listMonitorId[0]}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.httpService.axiosRef.delete(
        this.configService.get('KUMA_DOMAIN') + `/monitors/${listMonitorId[1]}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.serverModal.findByIdAndUpdate(removeKumaDto.id, {
        monitorId: [],
        isConnectKuma: 0,
      });
      return 'remove monitoring successfully';
    } catch (error) {
      console.log(error);
    }
  }
}
