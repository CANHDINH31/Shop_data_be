import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';
import { SyncServerDto } from './dto/sync-server.dto';
import { AddKeyDto } from './dto/add-key.dto';
import { RenameKeyDto } from './dto/rename-key.dto';
import { RemoveKeyDto } from './dto/remove-key.dto';
import { DisableKeyDto } from './dto/disable-key.dto';
import { EnableKeyDto } from './dto/enable-key.dto';
import { AddDataLimitDto } from './dto/add-data-limit.dto';
import { Gist } from 'src/schemas/gists.schema';
import { Octokit } from '@octokit/core';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class ServersService {
  private readonly octokit;

  constructor(
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    private configService: ConfigService,
  ) {
    this.octokit = new Octokit({
      auth: configService.get('PERSONAL_GIST_TOKEN'),
    });
  }

  async sync(syncServerDto: SyncServerDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: syncServerDto.apiUrl,
        fingerprint: syncServerDto.fingerPrint,
      });

      const server = await outlineVpn.getServer();

      const serverMongo = await this.serverModal.findOne({
        serverId: server.serverId,
      });

      if (serverMongo) {
        await this.serverModal.findByIdAndUpdate(serverMongo._id, {
          ...server,
          ...syncServerDto,
        });
      } else {
        await this.serverModal.create({
          ...server,
          ...syncServerDto,
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

  async addKey(addKeyDto: AddKeyDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: addKeyDto.apiUrl,
        fingerprint: addKeyDto.fingerPrint,
      });

      const user = await outlineVpn.createUser();
      const { id, ...rest } = user;

      const server = await outlineVpn.getServer();
      const serverMongo = await this.serverModal.findOne({
        serverId: server.serverId,
      });

      await this.keyModal.create({
        keyId: id,
        serverId: serverMongo._id,
        ...rest,
      });

      return {
        status: HttpStatus.OK,
        message: 'Thêm key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async renameKey(id: string, renameKeyDto: RenameKeyDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: renameKeyDto.apiUrl,
        fingerprint: renameKeyDto.fingerPrint,
      });

      await outlineVpn.renameUser(id, renameKeyDto.name);

      await this.keyModal.findOneAndUpdate(
        { keyId: id },
        { name: renameKeyDto.name },
      );

      return {
        status: HttpStatus.OK,
        message: 'Cập nhật key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async disableKey(id: string, disableKeyDto: DisableKeyDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: disableKeyDto.apiUrl,
        fingerprint: disableKeyDto.fingerPrint,
      });

      await outlineVpn.disableUser(id);

      await this.keyModal.findOneAndUpdate(
        { keyId: id },
        { dataLimit: 0, enable: false },
      );

      return {
        status: HttpStatus.OK,
        message: 'disable key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async enableKey(id: string, enableKeyDto: EnableKeyDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: enableKeyDto.apiUrl,
        fingerprint: enableKeyDto.fingerPrint,
      });

      await outlineVpn.enableUser(id);

      await this.keyModal.findOneAndUpdate(
        { keyId: id },
        { dataLimit: 120000000000, enable: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'enable key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const listServer = await this.serverModal.find().sort({ createdAt: -1 });
      const resultList = [];
      for (const server of listServer) {
        const listKeys = await this.keyModal.find({ serverId: server._id });
        resultList.push({
          ...server.toObject(),
          listKeys,
        });
      }

      return resultList;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const listServer = await this.serverModal.findById(id);
      const listKeys = await this.keyModal.find({ serverId: id });
      return { ...listServer.toObject(), listKeys };
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateServerDto: UpdateServerDto) {
    return `This action updates a #${id} server`;
  }

  async remove(id: string) {
    try {
      await this.serverModal.deleteOne({ _id: id });
      await this.keyModal.deleteMany({ serverId: id });
      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async removeKey(id: string, removeKeyDto: RemoveKeyDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: removeKeyDto.apiUrl,
        fingerprint: removeKeyDto.fingerPrint,
      });

      await outlineVpn.deleteUser(id);

      const server = await outlineVpn.getServer();

      const serverMongo = await this.serverModal.findOne({
        serverId: server.serverId,
      });

      await this.keyModal.deleteOne({ keyId: id, serverId: serverMongo._id });

      const gist = await this.gistModal.findOne({
        keyId: id,
        serverId: serverMongo._id,
      });

      if (gist) {
        await this.octokit.request(`DELETE /gists/${gist.gistId}`, {
          gist_id: `${gist.gistId}`,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        await this.gistModal.findByIdAndDelete(gist._id);
      }

      return {
        status: HttpStatus.OK,
        message: 'Xóa key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async addDataLimit(id: string, addDataLimitDto: AddDataLimitDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: addDataLimitDto.apiUrl,
        fingerprint: addDataLimitDto.fingerPrint,
      });

      const data = addDataLimitDto.bytes * 1000000000;
      await outlineVpn.addDataLimit(id, data);

      await this.keyModal.findOneAndUpdate(
        { keyId: id },
        { dataLimit: data, enable: true },
      );

      return {
        status: HttpStatus.OK,
        message: 'Thêm data thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async getDataUsage() {
    try {
      const listServer = await this.serverModal.find({});

      for (const server of listServer) {
        const outlineVpn = new OutlineVPN({
          apiUrl: server.apiUrl,
          fingerprint: server.fingerPrint,
        });

        const dataUsage = await outlineVpn.getDataUsage();
        const bytesTransferredByUserId = dataUsage.bytesTransferredByUserId;

        const arrayDataUsage = Object.entries(bytesTransferredByUserId).map(
          ([keyId, value]) => ({
            keyId,
            value,
          }),
        );

        for (const key of arrayDataUsage) {
          const keyMongo = await this.keyModal.findOne({
            serverId: server._id,
            keyId: key.keyId,
          });

          if (keyMongo) {
            await this.keyModal.findByIdAndUpdate(keyMongo._id, {
              dataUsage: key.value,
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkExpiredKey() {
    try {
      const listKey = (await this.keyModal
        .find({})
        .populate('serverId')) as any[];

      const today = moment();
      const expiredKeys = listKey.filter((key) => {
        const endDate = moment(key.endDate);
        return endDate.isBefore(today);
      });

      for (const key of expiredKeys) {
        const outlineVpn = new OutlineVPN({
          apiUrl: key.serverId.apiUrl,
          fingerprint: key.serverId.fingerprint,
        });

        await outlineVpn.deleteUser(key.keyId);

        const gist = await this.gistModal.findOne({
          keyId: key.keyId,
          serverId: key.serverId._id,
        });

        if (gist) {
          await this.octokit.request(`DELETE /gists/${gist.gistId}`, {
            gist_id: `${gist.gistId}`,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });
          await this.gistModal.findByIdAndDelete(gist._id);
        }

        await this.keyModal.deleteOne({
          keyId: key.keyId,
          serverId: key.serverId,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async checkCronEveryMinute() {
    try {
      const name = 'TEST CRONJOB' + Date.now();
      await this.keyModal.create({ name });
      console.log('EVERY_MINUTE');
    } catch (error) {}
  }

  async checkCronEveryMinute1() {
    try {
      const name = 'TEST CRONJOB 1' + Date.now();
      await this.keyModal.create({ name });
      console.log('EVERY_MINUTE');
    } catch (error) {}
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  checkCronEveryDayAt1AM() {
    console.log('EVERY_DAY_AT_1AM');
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  checkCronEveryDayAt2AM() {
    console.log('EVERY_DAY_AT_2AM');
  }
}
