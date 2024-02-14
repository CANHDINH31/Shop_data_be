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

@Injectable()
export class GistsService {
  private readonly octokit;
  constructor(
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    private configService: ConfigService,
  ) {
    this.octokit = new Octokit({
      auth: configService.get('PERSONAL_GIST_TOKEN'),
    });
  }

  async create(createGistDto: CreateGistDto) {
    try {
      const plan = await this.planModal.findById(createGistDto.planId);
      const startDate = moment().format('YYYYMMDD');
      const endDate = moment().add(plan.day, 'd').format('YYYYMMDD');
      const gist = await this.gistModal.create({
        ...createGistDto,
        startDate,
        endDate,
      });

      const fileName = `${startDate}-${endDate}-${createGistDto.userId}-${createGistDto.planId}-${gist._id}`;

      await this.octokit.request('POST /gists', {
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

      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all gists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gist`;
  }

  update(id: number, updateGistDto: UpdateGistDto) {
    return `This action updates a #${id} gist`;
  }

  remove(id: number) {
    return `This action removes a #${id} gist`;
  }
}
