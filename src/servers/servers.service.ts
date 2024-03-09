import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    private keyService: KeysService,
    private configService: ConfigService,
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
      return await this.serverModal.find(query).sort({ createdAt: -1 });
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

  async remove(id: string) {
    try {
      const listKey: any = await this.keyModal
        .find({ serverId: id, status: 1 })
        .populate('serverId')
        .populate('awsId');

      await this.serverModal.findByIdAndUpdate(id, { status: 0 });

      if (listKey?.length > 0) {
        const outlineVpn = new OutlineVPN({
          apiUrl: listKey[0].serverId.apiUrl,
          fingerprint: listKey[0]?.serverId?.fingerPrint,
        });

        for (const key of listKey) {
          const gist: any = await this.gistModal.findOne({
            keyId: key._id,
            status: 1,
          });

          await outlineVpn.deleteUser(key.keyId);
          await this.keyModal.findByIdAndUpdate(key._id, { status: 0 });
          await this.gistModal.findByIdAndUpdate(gist._id, { status: 0 });
          await this.awsModal.findByIdAndUpdate(key?.awsId?._id, { status: 0 });

          await this.S3.deleteObject({
            Bucket: this.configService.get('S3_BUCKET'),
            Key: key?.awsId?.awsId,
          }).promise();
        }
      }

      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
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

  // @Cron(CronExpression.EVERY_12_HOURS)
  async getDataUsage() {
    try {
      console.log('start cron data usage');
      const listKey: any = await this.keyModal
        .find({ status: 1 })
        .populate('serverId');

      for (const key of listKey) {
        const outlineVpn = new OutlineVPN({
          apiUrl: key.serverId.apiUrl,
          fingerprint: key.serverId.fingerPrint,
        });

        const dataUsage = await outlineVpn.getDataUsage();
        const bytesTransferredByUserId = dataUsage.bytesTransferredByUserId;

        await this.keyModal.findByIdAndUpdate(key._id, {
          dataUsage: bytesTransferredByUserId[key.keyId],
        });
      }
      console.log('finnish cron data usage');
    } catch (error) {
      throw error;
    }
  }
}
