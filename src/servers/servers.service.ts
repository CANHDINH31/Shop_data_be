import { Injectable } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';

@Injectable()
export class ServersService {
  constructor(
    @InjectModel(Server.name) private gistModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
  ) {}

  async create(createServerDto: CreateServerDto) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: createServerDto.apiUrl,
        fingerprint: createServerDto.fingerPrint,
      });

      const server = outlineVpn.getServer();
      const users = outlineVpn.getUsers();

      return users;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all servers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} server`;
  }

  update(id: number, updateServerDto: UpdateServerDto) {
    return `This action updates a #${id} server`;
  }

  remove(id: number) {
    return `This action removes a #${id} server`;
  }
}
