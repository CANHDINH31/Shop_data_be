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
import { OutlineVPN } from 'outlinevpn-api';

@Injectable()
export class GistsService {
  private readonly octokit;
  private readonly outlineVpn;

  constructor(
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    private configService: ConfigService,
  ) {
    this.octokit = new Octokit({
      auth: configService.get('PERSONAL_GIST_TOKEN'),
    });

    this.outlineVpn = new OutlineVPN({
      apiUrl: 'https://64.176.49.96:35671/yOZ-4uwlx5Tk1ZyPPeuIDQ',
      fingerprint:
        'C754811394D11AD385FEB63AD85987F93821CED3FBE0B11AAF1713DBE1E90E87',
    });
  }

  async create(createGistDto: CreateGistDto) {
    try {
      const plan = await this.planModal.findById(createGistDto.planId);
      const startDate = moment().format('YYYY-MM-DD');
      const endDate = moment().add(plan.day, 'd').format('YYYY-MM-DD');

      const fileName = `${startDate}*${endDate}*${createGistDto.userId}*${createGistDto.planId}.txt`;

      const gist = await this.octokit.request('POST /gists', {
        description: fileName,
        public: true,
        files: {
          [fileName]: {
            content: 'Hello World',
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

  async test() {
    try {
      const users = await this.outlineVpn.getDataUsage();
      return users;
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
