import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Key } from 'src/schemas/keys.schema';
import mongoose, { Model } from 'mongoose';
import { Gist } from 'src/schemas/gists.schema';
import { Plan } from 'src/schemas/plans.schema';
import { User } from 'src/schemas/users.schema';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Transaction } from 'src/schemas/transactions.schema';
import { Collab } from 'src/schemas/collabs.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Aws } from 'src/schemas/awses.schema';
import * as AWS from 'aws-sdk';
import { MigrateKeyDto } from './dto/migrate-key.dto';
import { Server } from 'src/schemas/servers.schema';
import { Test } from 'src/schemas/tests.schema';
import { generateRandomString } from 'src/utils';
import { AddDataLimitDto } from 'src/servers/dto/add-data-limit.dto';
import { AddDataLimitKey } from './dto/add-data-limit-key.dto';
import { ObjectId } from 'typeorm';
import { RenameKeyDto } from './dto/rename-key.dto';
import { MultiMigrateKeyDto } from './dto/multi-migrate-key.dto';

@Injectable()
export class KeysService {
  private readonly S3;

  constructor(
    @InjectModel(Test.name) private testModal: Model<Test>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Gist.name) private gistModal: Model<Key>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Collab.name) private collabModal: Model<Collab>,
    @InjectModel(Aws.name) private awsModal: Model<Aws>,
    private configService: ConfigService,
  ) {
    this.S3 = new AWS.S3({
      accessKeyId: configService.get('S3_ACCESS_KEY'),
      secretAccessKey: configService.get('S3_ACCESS_SECRET'),
      region: configService.get('S3_REGION'),
    });
  }

  create(createKeyDto: CreateKeyDto) {
    return 'This action adds a new key';
  }

  async multiMigrate(multiMigrateKeyDto: MultiMigrateKeyDto) {
    try {
      for (const keyId of multiMigrateKeyDto.listKeyId) {
        await this.migrate({ keyId, serverId: multiMigrateKeyDto.serverId });
      }
      return {
        status: HttpStatus.CREATED,
        message: 'Multi migrate key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async migrate(migrateKeyDto: MigrateKeyDto) {
    try {
      const newServer = await this.serverModal.findById(migrateKeyDto.serverId);

      const outlineVpn = new OutlineVPN({
        apiUrl: newServer.apiUrl,
        fingerprint: newServer.fingerPrint,
      });

      // Tạo user trên server mới
      const userVpn = await outlineVpn.createUser();
      const { id, ...rest } = userVpn;

      const key: any = await this.keyModal
        .findById(migrateKeyDto.keyId)
        .populate('awsId')
        .populate('serverId');

      await outlineVpn.addDataLimit(id, key?.dataExpand);
      await outlineVpn.renameUser(id, key?.name);

      const gist: any = await this.gistModal.findOne({
        keyId: migrateKeyDto.keyId,
      });

      // Cập nhật lại key trên aws, và tạo mới trên mongo
      const keyAws = await this.S3.upload({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: key?.awsId?.awsId,
        Body: JSON.stringify({
          server: newServer.hostnameForAccessKeys,
          server_port: newServer.portForNewAccessKeys,
          password: rest.password,
          method: rest.method,
        }),
        ContentType: 'application/json',
      }).promise();

      const keyAwsMongo = await this.awsModal.create({
        awsId: keyAws.Key,
        fileName: keyAws.Location,
      });

      // Tạo key mới
      const newKey = await this.keyModal.create({
        keyId: id,
        userId: key?.userId,
        awsId: keyAwsMongo?._id,
        account: key?.account,
        serverId: migrateKeyDto?.serverId,
        startDate: key?.startDate,
        endDate: key?.endDate,
        dataLimit: key?.dataLimit,
        dataUsage: key?.dataUsage,
        endExpandDate: key?.endExpandDate,
        enable: key?.enable,
        dataExpand: key?.dataExpand,
        name: key?.name,
        password: rest?.password,
        port: rest?.port,
        method: rest?.method,
        accessUrl: rest?.accessUrl,
      });

      await this.gistModal.create({
        code: gist.code,
        gistId: gist._id,
        userId: gist?.userId,
        planId: gist.planId,
        keyId: newKey._id,
        fileName: gist.fileName,
        extension: gist.extension,
      });

      // Cập nhật status = 2
      const aws: any = await this.awsModal.findById(key?.awsId?._id);
      await this.keyModal.findByIdAndUpdate(key._id, { status: 2 });
      await this.gistModal.findByIdAndUpdate(gist._id, { status: 2 });
      await this.awsModal.findByIdAndUpdate(aws._id, { status: 2 });

      // disable key sau khi migrate
      if (!newKey.enable) {
        await this.disable(newKey?._id?.toString());
      }

      // //Xóa user trên outline cũ
      // const oldOutlineVpn = new OutlineVPN({
      //   apiUrl: key?.serverId?.apiUrl,
      //   fingerprint: key?.serverId?.fingerPrint,
      // });

      // await oldOutlineVpn.deleteUser(key.keyId);

      return {
        status: HttpStatus.CREATED,
        message: 'Migrate key thành công',
      };
    } catch (error) {
      throw error;
    }
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
        .populate('serverId')
        .populate('awsId');
    } catch (error) {
      throw error;
    }
  }

  async disable(id: string) {
    try {
      const key: any = await this.keyModal
        .findById(id)
        .populate('serverId')
        .populate('awsId');

      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key?.serverId?.fingerPrint,
      });

      await outlineVpn.disableUser(key?.keyId);
      await this.keyModal.findByIdAndUpdate(key._id, { enable: false });

      return {
        status: HttpStatus.OK,
        message: 'Disable key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async enable(id: string) {
    try {
      const key: any = await this.keyModal
        .findById(id)
        .populate('serverId')
        .populate('awsId');

      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key?.serverId?.fingerPrint,
      });

      await outlineVpn.enableUser(key?.keyId);
      await outlineVpn.addDataLimit(key?.keyId, key?.dataExpand);
      await this.keyModal.findByIdAndUpdate(key._id, { enable: true });

      return {
        status: HttpStatus.OK,
        message: 'Enable key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async addDataLimit(id: string, addDataLimitKey: AddDataLimitKey) {
    try {
      const key: any = await this.keyModal
        .findById(id)
        .populate('serverId')
        .populate('awsId');

      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key?.serverId?.fingerPrint,
      });

      await outlineVpn.enableUser(key?.keyId);
      const data = addDataLimitKey.data * 1000000000;
      await outlineVpn.addDataLimit(key?.keyId, Number(data));
      await this.keyModal.findByIdAndUpdate(key._id, {
        enable: true,
        dataLimit: data,
        dataExpand: data,
      });

      return {
        status: HttpStatus.OK,
        message: 'Add data thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const key = await this.keyModal
        .findById(id)
        .populate('awsId')
        .populate('serverId');

      const gist = await this.gistModal
        .findOne({ keyId: key._id })
        .populate('userId')
        .populate('planId');

      const name = key?.name;
      let historyKey = [];
      if (name) {
        const listHistoryKey = await this.keyModal
          .find({ name })
          .populate('serverId');
        historyKey = listHistoryKey?.filter(
          (e) => e?._id.toString() !== key?._id?.toString(),
        );
      }
      return { ...key.toObject(), gist, historyKey };
    } catch (error) {
      throw error;
    }
  }

  async upgrade(id: string) {
    try {
      const gist: any = await this.gistModal
        .findOne({ keyId: id })
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

      const code = `${moment().format('YYYYMMDD')}-${generateRandomString(
        4,
      ).toLowerCase()}`;

      await this.transactionModal.create({
        code,
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

  async rename(id: string, renameKeyDto: RenameKeyDto) {
    try {
      const existKey = await this.keyModal.findOne({
        status: 1,
        name: renameKeyDto.name,
      });

      if (existKey)
        throw new BadRequestException({
          message: 'Tên key đã tồn tại',
        });

      const key: any = await this.keyModal.findById(id).populate('serverId');

      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key?.serverId?.fingerPrint,
      });

      await outlineVpn.renameUser(key?.keyId, renameKeyDto.name);

      const data = await this.keyModal.findByIdAndUpdate(
        id,
        { name: renameKeyDto.name },
        { new: true },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const key: any = await this.keyModal
        .findById(id)
        .populate('serverId')
        .populate('awsId');

      const gist: any = await this.gistModal.findOne({
        keyId: key._id,
        status: 1,
      });

      key && (await this.keyModal.findByIdAndUpdate(key._id, { status: 0 }));
      gist && (await this.gistModal.findByIdAndUpdate(gist._id, { status: 0 }));
      key &&
        (await this.awsModal.findByIdAndUpdate(key?.awsId?._id, { status: 0 }));

      await this.S3.deleteObject({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: key?.awsId?.awsId,
      }).promise();

      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key?.serverId?.fingerPrint,
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

  // @Cron(CronExpression.EVERY_10_MINUTES)
  async checkCron() {
    try {
      await this.testModal.create({ value: Date.now() });
    } catch (error) {
      throw error;
    }
  }

  async test(body: any) {
    try {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      const gist: any = await this.gistModal
        .findOne({
          status: 1,
          extension: body?.extension,
        })
        .populate('keyId');

      if (gist) {
        const newKey = await this.keyModal.findOneAndUpdate(
          { _id: gist?.keyId?._id },
          { $set: { startDate, endDate } },
          { new: true },
        );

        return newKey;
      }

      return '0';
    } catch (error) {
      throw error;
    }
  }
}
