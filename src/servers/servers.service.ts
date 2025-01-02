import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';
import { SyncServerDto } from './dto/sync-server.dto';
import { Gist } from 'src/schemas/gists.schema';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UpdateLocationServerDto } from './dto/update-location-server.dto';
import { UpdateNameServerDto } from './dto/update-name-server.dto';
import { Aws } from 'src/schemas/awses.schema';
import * as AWS from 'aws-sdk';
import { MigrateServerDto } from './dto/migrate-server.dto';
import { KeysService } from 'src/keys/keys.service';
import { SettingBandwidth } from 'src/schemas/settingBandwidths.schema';
import { SettingBandWidthDefaultDto } from './dto/setting-bandwidth-default.dto';
import { UpdateRemarkServerDto } from './dto/update-remark-server.dto';
import { UpdateTotalBandwidthServerDto } from './dto/update-total-bandwidth-server.dto';
import { CYCLE_PLAN } from 'src/utils/constant';
import { KumaService } from 'src/kuma/kuma.service';
import { UpdateStatusServerDto } from './dto/update-status-server.dto';
import { UpdateCloudManagerDto } from './dto/update-cloud-manager.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ServersService {
  private readonly S3;

  constructor(
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(Aws.name) private awsModal: Model<Aws>,
    @InjectModel(SettingBandwidth.name)
    private settingBandwidthModal: Model<SettingBandwidth>,
    @InjectQueue('data-usage') private dataUsageQueue: Queue,
    private keyService: KeysService,
    private configService: ConfigService,
    private kumaService: KumaService,
  ) {
    this.S3 = new AWS.S3({
      accessKeyId: configService.get('S3_ACCESS_KEY'),
      secretAccessKey: configService.get('S3_ACCESS_SECRET'),
      region: configService.get('S3_REGION'),
    });
  }

  async settingBandWidthDefault(
    settingBandWidthDefaultDto: SettingBandWidthDefaultDto,
  ) {
    try {
      const settingBandwidthDefault = await this.settingBandwidthModal.findOne(
        {},
      );
      if (settingBandwidthDefault) {
        await this.settingBandwidthModal.findByIdAndUpdate(
          settingBandwidthDefault._id,
          {
            value: Number(settingBandWidthDefaultDto.value) * 1000000000,
          },
        );
      } else {
        await this.settingBandwidthModal.create({
          value: Number(settingBandWidthDefaultDto.value) * 1000000000,
        });
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Thiết lập bandwidth thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async findSettingBandWidthDefault() {
    try {
      return await this.settingBandwidthModal.findOne();
    } catch (error) {
      throw error;
    }
  }

  async migrate(migrateServerDto: MigrateServerDto) {
    try {
      const listKey = await this.keyModal.find({
        serverId: migrateServerDto.oldServerId,
        status: 1,
      });

      for (const key of listKey) {
        await this.keyService.migrate({
          keyId: key._id?.toString(),
          serverId: migrateServerDto.newServerId,
        });
      }

      return {
        status: HttpStatus.OK,
        message: 'Migrate server thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(syncServerDto: SyncServerDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: syncServerDto.apiUrl,
        fingerprint: syncServerDto.fingerPrint,
      });
      const server: any = await outlineVpn.getServer();
      if (syncServerDto?.isCheckUnique !== '1') {
        const existServerRemoved = await this.serverModal.findOne({
          hostnameForAccessKeys: server.hostnameForAccessKeys,
          status: 0,
        });
        if (existServerRemoved) {
          return {
            status: HttpStatus.OK,
            isCheckUnique: 1,
            message: 'Server đã được xóa trước đây',
          };
        }
        const existServerActive = await this.serverModal.findOne({
          hostnameForAccessKeys: server.hostnameForAccessKeys,
          status: 1,
        });
        if (existServerActive) {
          return {
            status: HttpStatus.OK,
            isCheckUnique: 1,
            message: 'Server đang năm trong danh sách server active',
          };
        }
        const existServerDowned = await this.serverModal.findOne({
          hostnameForAccessKeys: server.hostnameForAccessKeys,
          status: 2,
        });
        if (existServerDowned) {
          return {
            status: HttpStatus.OK,
            isCheckUnique: 1,
            message: 'Server đang năm trong danh sách server down',
          };
        }
        const existServerMaintain = await this.serverModal.findOne({
          hostnameForAccessKeys: server.hostnameForAccessKeys,
          status: 3,
        });
        if (existServerMaintain) {
          return {
            status: HttpStatus.OK,
            isCheckUnique: 1,
            message: 'Server đang năm trong danh sách server maintain',
          };
        }
      }

      const serverMongo = await this.serverModal.findOne({
        hostnameForAccessKeys: server.hostnameForAccessKeys,
        status: 1,
      });
      if (serverMongo) {
        await this.serverModal.findByIdAndUpdate(serverMongo._id, {
          ...server,
          ...syncServerDto,
          totalBandWidth:
            syncServerDto?.totalBandWidth > 0
              ? syncServerDto?.totalBandWidth * 1000000000
              : 6000000000000,
        });
      } else {
        await this.serverModal.create({
          ...server,
          ...syncServerDto,
          totalBandWidth:
            syncServerDto?.totalBandWidth > 0
              ? syncServerDto?.totalBandWidth * 1000000000
              : 6000000000000,
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Đồng bộ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async getServerToMigrate(req: any) {
    try {
      let query = {};
      query = {
        ...(req?.query?.status && {
          status: req.query.status,
        }),
        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),
        ...(req?.query?.location && {
          location: { $regex: req.query.location, $options: 'i' },
        }),
      };

      const servers = await this.serverModal
        .find(query)
        .sort({ createdAt: -1 });

      const listResult = [];

      for (const sv of servers) {
        const numberKey = await this.keyModal.countDocuments({
          serverId: sv._id,
          status: 1,
        });

        listResult.push({ ...sv.toObject(), numberKey });
      }

      return listResult;
    } catch (error) {
      throw error;
    }
  }

  async getNormalServer(req: any) {
    try {
      let query = {};
      query = {
        ...(req?.query?.status && {
          status: req.query.status,
        }),
        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),
        ...(req?.query?.location && {
          location: { $regex: req.query.location, $options: 'i' },
        }),
      };

      const listResult = [];
      const listServer = await this.serverModal
        .find(query)
        .sort({ createdAt: -1 });

      for (const server of listServer) {
        const numberKey = await this.keyModal.countDocuments({
          serverId: server._id,
          status: 1,
        });
        listResult.push({ ...server.toObject(), numberKey });
      }

      return listResult;
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: any) {
    try {
      let query = {};
      query = {
        ...(req?.query?.status && {
          status: req.query.status,
        }),
        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),
        ...(req?.query?.location && {
          location: { $regex: req.query.location, $options: 'i' },
        }),
      };

      const listResult = [];
      const listServer = await this.serverModal
        .find(query)
        .sort({ createdAt: -1 });

      for (const server of listServer) {
        const numberKey = await this.keyModal.countDocuments({
          serverId: server._id,
          status: 1,
        });

        if (server.status === 1) {
          // const outlineVpn = new OutlineVPN({
          //   apiUrl: server.apiUrl,
          //   fingerprint: server.fingerPrint,
          // });

          try {
            // // CALC DATASTRANFER
            // const data = await outlineVpn.getDataUsage();
            // const values = Object.values(data.bytesTransferredByUserId);
            // const dataTransfer = values.reduce((a, b) => a + b, 0);

            // CALC MaxUsage
            const maxUsage = await this.keyModal.aggregate([
              {
                $match: {
                  serverId: new mongoose.Types.ObjectId(server._id),
                  status: 1,
                },
              },
              {
                $group: { _id: server._id, maxUsage: { $sum: '$dataExpand' } },
              },
            ]);

            const r = await this.serverModal.findByIdAndUpdate(
              server._id,
              {
                // dataTransfer,
                maxUsage: maxUsage?.[0]?.maxUsage,
              },
              { new: true },
            );

            listResult.push({ ...r.toObject(), numberKey });
          } catch (error) {
            listResult.push({ ...server.toObject(), numberKey });
            continue;
          }
        } else {
          listResult.push({ ...server.toObject(), numberKey });
        }
      }

      return listResult;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.serverModal.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateLocation(
    id: string,
    updateLocationServerDto: UpdateLocationServerDto,
  ) {
    try {
      const data = await this.serverModal.findByIdAndUpdate(
        id,
        {
          location: updateLocationServerDto.location,
        },
        { new: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật địa chỉ thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRemark(id: string, updateRemarkServerDto: UpdateRemarkServerDto) {
    try {
      const data = await this.serverModal.findByIdAndUpdate(
        id,
        {
          remark: updateRemarkServerDto.remark,
        },
        { new: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật remark thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateTotalBanwidth(
    id: string,
    updateTotalBandwidthServerDto: UpdateTotalBandwidthServerDto,
  ) {
    try {
      const data = await this.serverModal.findByIdAndUpdate(
        id,
        {
          totalBandWidth:
            Number(updateTotalBandwidthServerDto.totalBandwidth) * 1000000000,
        },
        { new: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật total bandwidth thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateNameServer(id: string, updateNameServerDto: UpdateNameServerDto) {
    try {
      const server = await this.serverModal.findById(id);

      const outlineVpn = new OutlineVPN({
        apiUrl: server.apiUrl,
        fingerprint: server.fingerPrint,
      });

      await outlineVpn.renameServer(updateNameServerDto.name);

      const data = await this.serverModal.findByIdAndUpdate(
        id,
        {
          name: updateNameServerDto.name,
        },
        { new: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật name server thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateStautsServer(
    id: string,
    updateStatusServerDto: UpdateStatusServerDto,
  ) {
    try {
      const data = await this.serverModal.findByIdAndUpdate(
        id,
        {
          status: updateStatusServerDto.status,
        },
        { new: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật status server thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCloudManager(
    id: string,
    updateCloudManagerDto: UpdateCloudManagerDto,
  ) {
    try {
      const data = await this.serverModal.findByIdAndUpdate(
        id,
        {
          cloudManagerId: updateCloudManagerDto.cloudManagerId,
        },
        { new: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật cloud manager thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, req: any) {
    try {
      const listKey: any = await this.keyModal
        .find({ serverId: id, status: 1 })
        .populate('serverId')
        .populate('awsId');

      if (req.query.isDeleteKuma == 1) {
        await this.kumaService.remove({ id });
      }

      await this.serverModal.findByIdAndUpdate(id, { status: 0 });

      if (listKey?.length > 0) {
        for (const key of listKey) {
          await this.keyService.remove(key._id);
        }
      }

      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createDefaulBandWidth() {
    try {
      const settingBandWidthDefault =
        await this.settingBandwidthModal.findOne();

      if (settingBandWidthDefault) return;

      await this.settingBandwidthModal.create({
        value: Number(this.configService.get('BANDWIDTH_DEFAULT')) * 1000000000,
      });
    } catch (error) {
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async getDataUsage() {
    try {
      const amountQueueWating = await this.dataUsageQueue.count();
      if (amountQueueWating > 200) {
        await this.dataUsageQueue.clean(0, 100, 'wait');
      }

      console.log('start cron data usage: ', Date.now());

      let skip = 0;
      const limit = 10;
      let listKey: any = [];

      do {
        listKey = await this.keyModal
          .find({ status: 1 })
          .skip(skip)
          .limit(limit)
          .populate('serverId');

        if (listKey.length > 0) {
          await this.dataUsageQueue.add('data-usage', { data: listKey });
        }

        skip += limit;
      } while (listKey.length > 0);

      console.log('finnish cron data usage: ', Date.now());
    } catch (error) {
      throw error;
    }
  }

  public async _handleCoreGetDataUsage(listKey: any) {
    for (const key of listKey) {
      let dataAdd = 0;
      let dataUsageYesterday = 0;

      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key.serverId.fingerPrint,
      });
      try {
        const dataUsage = await outlineVpn.getDataUsage();
        const bytesTransferredByUserId = dataUsage.bytesTransferredByUserId;
        dataUsageYesterday = bytesTransferredByUserId[key.keyId] || 0;
      } catch (error) {
        continue;
      }

      const arrayDataUsage = key?.arrayDataUsage || [];
      let counterMigrate = key?.counterMigrate || 0;
      if (counterMigrate > 0) {
        dataAdd =
          Number(dataUsageYesterday) - Number(key.dataUsageYesterday) > 0
            ? Number(dataUsageYesterday) - Number(key.dataUsageYesterday)
            : 0;
        if (arrayDataUsage?.length < CYCLE_PLAN) {
          arrayDataUsage.push(dataAdd);
        } else {
          arrayDataUsage.push(dataAdd);
          arrayDataUsage.shift();
        }
        counterMigrate = counterMigrate - 1;
      } else {
        if (arrayDataUsage?.length < CYCLE_PLAN) {
          dataAdd =
            Number(dataUsageYesterday) - Number(key.dataUsageYesterday) > 0
              ? Number(dataUsageYesterday) - Number(key.dataUsageYesterday)
              : 0;
          arrayDataUsage.push(dataAdd);
        } else {
          dataAdd =
            Number(dataUsageYesterday) -
              Number(key.dataUsageYesterday) +
              Number(arrayDataUsage[0]) >
            0
              ? Number(dataUsageYesterday) -
                Number(key.dataUsageYesterday) +
                Number(arrayDataUsage[0])
              : 0;
          arrayDataUsage.push(dataAdd);
          arrayDataUsage.shift();
        }
      }
      const totalDataUsage =
        key?.arrayDataUsage?.reduce((a, b) => a + b, 0) || 0;
      await this.keyModal.findByIdAndUpdate(key._id, {
        dataUsageYesterday,
        arrayDataUsage: arrayDataUsage?.filter(
          (item) => item !== null && item !== undefined,
        ),
        dataUsage: totalDataUsage,
        counterMigrate,
      });
      if (totalDataUsage > key.dataExpand) {
        await this.keyService.disable(key._id);
      } else {
        await this.keyService.enable(key._id);
      }
    }
  }
}
