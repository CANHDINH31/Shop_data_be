import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';
import { SyncServerDto } from './dto/sync-server.dto';
import { User } from 'outlinevpn-api/dist/types';

@Injectable()
export class ServersService {
  constructor(
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
  ) {}

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

      const listKeys = await outlineVpn.getUsers();

      if (serverMongo) {
        await this.serverModal.findByIdAndUpdate(serverMongo._id, {
          ...server,
          ...syncServerDto,
        });

        await this.keyModal.deleteMany({ serverId: serverMongo._id });

        await this.createKey(listKeys, serverMongo._id.toString());
      } else {
        const newServer = await this.serverModal.create({
          ...server,
          ...syncServerDto,
        });

        await this.createKey(listKeys, newServer._id.toString());
      }

      return {
        status: HttpStatus.OK,
        message: 'Đồng bộ thành công',
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

  findOne(id: number) {
    return `This action returns a #${id} server`;
  }

  update(id: number, updateServerDto: UpdateServerDto) {
    return `This action updates a #${id} server`;
  }

  async remove(id: string) {
    try {
      await this.serverModal.deleteOne({ _id: id });
      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async createKey(listKeys: User[], serverId: string) {
    try {
      for (const key of listKeys) {
        const { id, ...rest } = key;
        await this.keyModal.create({
          keyId: id,
          serverId: serverId,
          ...rest,
        });
      }
    } catch (error) {}
  }
}
