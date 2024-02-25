import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUpgradeDto } from './dto/update-upgrade.dto';
import { BandWidthUpgradeDto } from './dto/band-width-upgrade.dto';
import { Octokit } from '@octokit/core';
import { ConfigService } from '@nestjs/config';
import { Gist } from 'src/schemas/gists.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ExtendPlan } from 'src/schemas/extendPlans.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Key } from 'src/schemas/keys.schema';
import { User } from 'src/schemas/users.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { PlanUpgradeDto } from './dto/plan-upgrade.dto';
import { Plan } from 'src/schemas/plans.schema';
import * as moment from 'moment';
import { Collab } from 'src/schemas/collabs.schema';

@Injectable()
export class UpgradesService {
  private readonly octokit;

  constructor(
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(ExtendPlan.name) private extendModal: Model<ExtendPlan>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Collab.name) private collabModal: Model<Collab>,
    private configService: ConfigService,
  ) {
    this.octokit = new Octokit({
      auth: configService.get('PERSONAL_GIST_TOKEN'),
    });
  }
  async upgradeBandwidth(bandWidthUpgradeDto: BandWidthUpgradeDto) {
    try {
      const extendPlan = await this.extendModal.findById(
        bandWidthUpgradeDto.extendPlanId,
      );

      const gist: any = await this.gistModal
        .findById(bandWidthUpgradeDto.gistId)
        .populate({
          path: 'keyId',
          populate: {
            path: 'serverId',
          },
        });

      const user = await this.userModal.findById(gist.userId._id);

      if (Number(extendPlan.price) > Number(user.money))
        throw new BadRequestException({
          message: 'Bạn không đủ tiền để đăng kí dịch vụ này',
        });

      const outlineVpn = new OutlineVPN({
        apiUrl: gist.keyId.serverId.apiUrl,
        fingerprint: gist.keyId.serverId.fingerPrint,
      });

      const data = gist.keyId.dataLimit + extendPlan.bandWidth * 1000000000;

      await outlineVpn.addDataLimit(gist.keyId.keyId, data);

      await this.keyModal.findByIdAndUpdate(gist.keyId, { dataLimit: data });

      const collab = await this.collabModal.findOne({});

      const disccount =
        user.level === 1
          ? collab['level1']
          : user.level === 2
          ? collab['level2']
          : user.level === 3
          ? collab['level3']
          : 0;

      const money = ((extendPlan.price * (100 - disccount)) / 100).toFixed(0);

      await this.transactionModal.create({
        userId: user._id,
        gistId: bandWidthUpgradeDto.gistId,
        extendPlanId: bandWidthUpgradeDto.extendPlanId,
        money: money,
        discount: disccount,
        description: `Đăng kí gói ${extendPlan.name}`,
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

  async upgradePlan(planUpgradeDto: PlanUpgradeDto) {
    try {
      const gist: any = await this.gistModal
        .findById(planUpgradeDto.gistId)
        .populate('keyId')
        .populate('planId');

      const plan = await this.planModal.findById(gist.planId);
      const user = await this.userModal.findById(gist.userId._id);

      if (Number(plan.price) > Number(user.money))
        throw new BadRequestException({
          message: 'Bạn không đủ tiền để đăng kí dịch vụ này',
        });

      const lastEndDate = moment(gist.keyId.endDate);
      const day = gist.planId.day;
      const endDate = lastEndDate.add(day, 'd');

      const fileName = `${moment(gist.keyId.startDate).format(
        'YYYYMMDD',
      )}-${moment(endDate).format('YYYYMMDD')}-${user._id}-${plan.name}.txt`;

      await this.keyModal.findByIdAndUpdate(gist.keyId._id, {
        endDate,
      });

      const newGist = await this.octokit.request('POST /gists', {
        description: fileName,
        public: true,
        files: {
          [fileName]: {
            content: gist?.keyId?.accessUrl,
          },
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      await this.octokit.request(`DELETE /gists/${gist.gistId}`, {
        gist_id: gist.gistId,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      await this.gistModal.findByIdAndUpdate(planUpgradeDto.gistId, {
        gistId: newGist?.data?.id,
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
        gistId: planUpgradeDto.gistId,
        planId: plan._id,
        money: money,
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

  findAll() {
    return `This action returns all upgrades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upgrade`;
  }

  update(id: number, updateUpgradeDto: UpdateUpgradeDto) {
    return `This action updates a #${id} upgrade`;
  }

  remove(id: number) {
    return `This action removes a #${id} upgrade`;
  }
}
