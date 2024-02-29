import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Key } from 'src/schemas/keys.schema';
import { Model } from 'mongoose';
import { Gist } from 'src/schemas/gists.schema';
import { Plan } from 'src/schemas/plans.schema';
import { User } from 'src/schemas/users.schema';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';
import { Transaction } from 'src/schemas/transactions.schema';
import { Collab } from 'src/schemas/collabs.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeysService {
  private readonly octokit;

  constructor(
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Gist.name) private gistModal: Model<Key>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Collab.name) private collabModal: Model<Collab>,
    private configService: ConfigService,
  ) {
    this.octokit = new Octokit({
      auth: configService.get('PERSONAL_GIST_TOKEN'),
    });
  }

  create(createKeyDto: CreateKeyDto) {
    return 'This action adds a new key';
  }

  async findAll(req: any) {
    try {
      let query = {};

      query = {
        ...(req?.query?.serverId && {
          serverId: req.query.serverId,
        }),

        ...(req?.query?.account && {
          account: { $regex: req.query.account, $options: 'i' },
        }),

        ...(req?.query?.status && {
          status: req.query.status,
        }),
      };

      return await this.keyModal
        .find(query)
        .populate('userId')
        .populate('serverId');
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} key`;
  }

  async upgrade(id: string) {
    try {
      const gist: any = await this.gistModal
        .findOne({ keyId: id })
        .populate('keyId')
        .populate('planId');

      const plan = await this.planModal.findById(gist.planId);
      const user = await this.userModal.findById(gist.userId._id);

      if (Number(plan.price) > Number(user.money))
        throw new BadRequestException({
          message: 'Tài khoản không đủ tiền để đăng kí dịch vụ này',
        });

      const lastEndDate = moment(gist.keyId.endDate);
      const day = gist.planId.day;
      const endDate = lastEndDate.add(day, 'd');

      await this.keyModal.findByIdAndUpdate(gist.keyId._id, {
        endDate,
      });

      const collab = await this.collabModal.findOne({});

      const disccount =
        user.level === 1
          ? collab['level1']
          : user.level === 2
          ? collab['level2']
          : user.level === 3
          ? collab['level3']
          : 0;

      const money = ((plan.price * (100 - disccount)) / 100).toFixed(0);

      await this.transactionModal.create({
        userId: user._id,
        gistId: gist._id,
        planId: plan._id,
        money: money,
        discount: disccount,
        description: `Đăng kí gói ${plan.name}`,
      });

      await this.userModal.findByIdAndUpdate(user._id, {
        $inc: { money: -money },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const key: any = await this.keyModal.findById(id).populate('serverId');
      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key?.serverId?.fingerPrint,
      });

      const gist: any = await this.gistModal.findOne({
        keyId: key._id,
        status: 1,
      });

      await this.keyModal.findByIdAndUpdate(key._id, { status: 0 });
      await this.gistModal.findByIdAndUpdate(gist._id, { status: 0 });

      await this.octokit.request(`DELETE /gists/${gist.gistId}`, {
        gist_id: `${gist.gistId}`,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      await outlineVpn.deleteUser(key.keyId);

      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async checkExpiredKey() {
    try {
      console.log('start cron check expire key');
      const listKey = (await this.keyModal
        .find({ status: 1 })
        .populate('serverId')) as any[];
      const today = moment();
      const expiredKeys = listKey.filter((key) => {
        const endDate = moment(key.endDate);
        return endDate.isBefore(today);
      });
      for (const key of expiredKeys) {
        await this.remove(key._id);
      }
      console.log('finnish cron check expire key');
    } catch (error) {
      throw error;
    }
  }
}
