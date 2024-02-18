import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';
import { SyncServerDto } from './dto/sync-server.dto';
import { User } from 'outlinevpn-api/dist/types';
import { AddKeyDto } from './dto/add-key.dto';
import { RenameKeyDto } from './dto/rename-key.dto';
import { RemoveKeyDto } from './dto/remove-key.dto';
import { DisableKeyDto } from './dto/disable-key.dto';
import { EnableKeyDto } from './dto/enable-key.dto';
import { AddDataLimitDto } from './dto/add-data-limit.dto';

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

  async addKey(addKeyDto: AddKeyDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: addKeyDto.apiUrl,
        fingerprint: addKeyDto.fingerPrint,
      });

      await outlineVpn.createUser();

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
