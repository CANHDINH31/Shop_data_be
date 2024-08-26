import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUpgradeDto } from './dto/update-upgrade.dto';
import { BandWidthUpgradeDto } from './dto/band-width-upgrade.dto';
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
import { generateRandomString } from 'src/utils';
import { RoseExtend } from 'src/schemas/roseExtends.schema';

@Injectable()
export class UpgradesService {
  constructor(
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(ExtendPlan.name) private extendModal: Model<ExtendPlan>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Collab.name) private collabModal: Model<Collab>,
    @InjectModel(RoseExtend.name) private roseExtend: Model<RoseExtend>,
    private configService: ConfigService,
  ) {}
  async upgradeBandwidth(bandWidthUpgradeDto: BandWidthUpgradeDto) {
    try {
      const extendPlan = await this.extendModal.findById(
        bandWidthUpgradeDto.extendPlanId,
      );

      const roseExtend = await this.roseExtend.findOne({});

      const gist: any = await this.gistModal
        .findById(bandWidthUpgradeDto.gistId)
        .populate({
          path: 'keyId',
          populate: {
            path: 'serverId',
          },
        })
        .populate('planId');

      if (gist?.planId?.price === 0) {
        throw new BadRequestException({
          message: 'Gói dùng thử không thể nâng cấp',
        });
      }

      const user = await this.userModal.findById(gist.userId._id);

      if (Number(extendPlan.price) > Number(user.money))
        throw new BadRequestException({
          message: 'Bạn không đủ tiền để đăng kí dịch vụ này',
        });

      const today = moment();

      if (
        gist.keyId.endExpandDate &&
        today.isBefore(moment(gist.keyId.endExpandDate))
      ) {
        throw new BadRequestException({
          message:
            'Bạn phải chờ hết thời gian mở rộng băng thông cũ, mới có thể mua thêm băng thông',
        });
      }

      const outlineVpn = new OutlineVPN({
        apiUrl: gist.keyId.serverId.apiUrl,
        fingerprint: gist.keyId.serverId.fingerPrint,
      });

      const data = gist.keyId.dataLimit + extendPlan.bandWidth * 1000000000;

      await outlineVpn.enableUser(gist.keyId.keyId);
      await outlineVpn.addDataLimit(gist.keyId.keyId, data);

      let endExpandDate;
      endExpandDate = today.add(bandWidthUpgradeDto.month, 'M');

      endExpandDate = moment(endExpandDate).isAfter(moment(gist.keyId.endDate))
        ? gist.keyId.endDate
        : endExpandDate;

      await this.keyModal.findByIdAndUpdate(gist.keyId, {
        dataExpand: data,
        endExpandDate,
        enable: true,
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

      const discount1 =
        bandWidthUpgradeDto.month >= 9
          ? roseExtend['level3']
          : bandWidthUpgradeDto.month >= 5
          ? roseExtend['level2']
          : roseExtend['level1'];

      const money = (
        (extendPlan.price *
          Number(bandWidthUpgradeDto.month) *
          (100 - disccount) *
          (100 - discount1)) /
        (100 * 100)
      ).toFixed(0);

      const code = `${moment().format('YYYYMMDD')}-${generateRandomString(
        4,
      ).toLowerCase()}`;

      await this.transactionModal.create({
        code,
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
      console.log(error);
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

      if (gist?.planId?.price === 0) {
        throw new BadRequestException({
          message: 'Gói dùng thử không thể nâng cấp',
        });
      }

      if (Number(plan.price) > Number(user.money))
        throw new BadRequestException({
          message: 'Bạn không đủ tiền để đăng kí dịch vụ này',
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

      const code = `${moment().format('YYYYMMDD')}-${generateRandomString(
        4,
      ).toLowerCase()}`;

      await this.transactionModal.create({
        code,
        userId: user._id,
        gistId: planUpgradeDto.gistId,
        planId: plan._id,
        money: money,
        discount: disccount,
        description: `Gia hạn gói ${plan.name}`,
      });

      await this.userModal.findByIdAndUpdate(user._id, {
        $inc: { money: -money },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Gia hạn thành công',
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
