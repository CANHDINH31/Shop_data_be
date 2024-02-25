import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';
import { SyncServerDto } from './dto/sync-server.dto';
import { Gist } from 'src/schemas/gists.schema';
import { Octokit } from '@octokit/core';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { UpdateLocationServerDto } from './dto/update-location-server.dto';
import { UpdateNameServerDto } from './dto/update-name-server.dto';

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
        status: 1,
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
        .populate('serverId');

      if (listKey?.length > 0) {
        const outlineVpn = new OutlineVPN({
          apiUrl: listKey[0].serverId.apiUrl,
          fingerprint: listKey[0]?.serverId?.fingerPrint,
        });

        await this.serverModal.findByIdAndUpdate(id, { status: 0 });

        for (const key of listKey) {
          const gist: any = await this.gistModal.findOne({
            keyId: key._id,
            status: 1,
          });

          await outlineVpn.deleteUser(key.keyId);
          await this.keyModal.findByIdAndUpdate(key._id, { status: 0 });
          await this.gistModal.findByIdAndUpdate(gist._id, { status: 0 });

          await this.octokit.request(`DELETE /gists/${gist.gistId}`, {
            gist_id: `${gist.gistId}`,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });
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

  // @Cron(CronExpression.EVERY_12_HOURS)
  @Cron(CronExpression.EVERY_MINUTE)
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
