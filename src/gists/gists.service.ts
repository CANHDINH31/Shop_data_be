import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGistDto } from './dto/create-gist.dto';
import { UpdateGistDto } from './dto/update-gist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Gist } from 'src/schemas/gists.schema';
import { Model } from 'mongoose';
import { Octokit } from '@octokit/core';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Plan } from 'src/schemas/plans.schema';
import { Server } from 'src/schemas/servers.schema';
import { Key } from 'src/schemas/keys.schema';
import { OutlineVPN } from 'outlinevpn-api';

@Injectable()
export class GistsService {
  private readonly octokit;

  constructor(
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    private configService: ConfigService,
  ) {
    this.octokit = new Octokit({
      auth: configService.get('PERSONAL_GIST_TOKEN'),
    });
  }

  async create(createGistDto: CreateGistDto) {
    try {
      const plan = await this.planModal.findById(createGistDto.planId);
      const startDate = moment();
      const endDate = moment().add(plan.day, 'd');

      const fileName = `${moment(startDate).format('YYYYMMDD')}-${moment(
        endDate,
      ).format('YYYYMMDD')}-${createGistDto.userId}-${plan.name}.txt`;

      const listServer = await this.serverModal
        .find()
        .select(['_id', 'limitNumberKey']);

      const keyCountByServerId = [];

      for (const server of listServer) {
        const keyCount = await this.keyModal.countDocuments({
          serverId: server._id,
        });
        keyCountByServerId.push({
          serverId: server._id,
          keyCount,
        });
      }

      // Sắp xếp danh sách keyCountByServerId theo số lượng key tăng dần
      const sortedKeyCountByServerId = keyCountByServerId.sort(
        (a, b) => a.keyCount - b.keyCount,
      );

      // Lấy serverId có ít key nhất
      const leastKeyServerId = sortedKeyCountByServerId[0].serverId;

      const serverMongo = await this.serverModal.findById(leastKeyServerId);

      const outlineVpn = new OutlineVPN({
        apiUrl: serverMongo.apiUrl,
        fingerprint: serverMongo.fingerPrint,
      });

      const user = await outlineVpn.createUser();
      const { id, ...rest } = user;

      const key = await this.keyModal.create({
        keyId: id,
        serverId: leastKeyServerId,
        startDate,
        endDate,
        ...rest,
      });

      const gist = await this.octokit.request('POST /gists', {
        description: fileName,
        public: true,
        files: {
          [fileName]: {
            content: user?.accessUrl,
          },
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      await this.gistModal.create({
        ...createGistDto,
        startDate,
        endDate,
        gistId: gist?.data?.id,
        fileName,
        keyId: key.keyId,
        serverId: sortedKeyCountByServerId[0].serverId,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.gistModal
        .find()
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('planId');
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const gistMongo = await this.gistModal
        .findById(id)
        .populate('userId')
        .populate('planId');

      const gist = await this.octokit.request(
        `GET /gists/${gistMongo.gistId}`,
        {
          gist_id: gistMongo.gistId,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      return {
        ...gistMongo.toObject(),
        gistInfo: gist.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateGistDto: UpdateGistDto) {
    try {
      const gist = await this.gistModal.findById(id);
      await this.octokit.request(`PATCH /gists/${gist.gistId}`, {
        gist_id: gist.gistId,
        description: '',
        files: {
          [gist.fileName]: {
            content: updateGistDto.content,
          },
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật thông tin thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const gist = await this.gistModal.findById(id);
      await this.octokit.request(`DELETE /gists/${gist.gistId}`, {
        gist_id: `${gist.gistId}`,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      await this.gistModal.deleteOne({ _id: id });

      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
