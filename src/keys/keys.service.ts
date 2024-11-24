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
import { AddDataLimitKey } from './dto/add-data-limit-key.dto';
import { RenameKeyDto } from './dto/rename-key.dto';
import { MultiMigrateKeyDto } from './dto/multi-migrate-key.dto';
import { CYCLE_PLAN } from 'src/utils/constant';
import { EndDateKeyDto } from './dto/end-date-key.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
    @InjectQueue('expried-key') private expriedKeyQueue: Queue,
    @InjectQueue('expried-data-expand-key')
    private expriedDataExpandQueue: Queue,
    private configService: ConfigService,
  ) {
    this.S3 = new AWS.S3({
      accessKeyId: configService.get('S3_ACCESS_KEY'),
      secretAccessKey: configService.get('S3_ACCESS_SECRET'),
      region: configService.get('S3_REGION'),
    });
  }

  async test() {
    try {
      const listKey: any = await this.keyModal.aggregate([
        {
          $match: {
            status: 1, // Chỉ lấy những document có status = 1
          },
        },
        {
          $group: {
            _id: {
              name: '$name',
              status: '$status',
            },
            keys: { $push: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 }, // Chỉ giữ lại những nhóm có hơn 1 document
          },
        },
      ]);

      const data = listKey?.map((k) => ({
        name: k?._id?.name,
        count: k?.count,
        keys: k?.keys?.map((sk) => ({ _id: sk._id, awsId: sk.awsId })),
      }));

      for (const d of data) {
        await this.keyModal.findOneAndDelete({
          _id: d.keys[0]._id,
        });

        await this.gistModal.findOneAndDelete({
          keyId: d.keys[0]._id,
        });

        await this.awsModal.findOneAndDelete({
          _id: d.keys[0].awsId,
        });
      }

      return data?.length;
    } catch (err) {
      throw err;
    }
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
          prefix: '\u0016\u0003\u0001\u0000¨\u0001\u0001',
        }),
        ContentType: 'application/json',
      }).promise();

      const keyAwsMongo = await this.awsModal.create({
        awsId: keyAws.Key,
        fileName: keyAws.Location,
        prefix: '\u0016\u0003\u0001\u0000¨\u0001\u0001',
      });

      // Tạo key mới
      const newKey = await this.keyModal.create({
        keyId: id,
        userId: key?.userId,
        awsId: keyAwsMongo?._id,
        account: key?.account,
        serverId: migrateKeyDto?.serverId,
        createDate: key?.createDate,
        migrateDate: moment(),
        startDate: key?.startDate,
        endDate: key?.endDate,
        dataLimit: key?.dataLimit,
        dataUsage: key?.dataUsage || 0,
        endExpandDate: key?.endExpandDate,
        dataUsageYesterday: 0,
        arrayDataUsage: key?.arrayDataUsage || [],
        enable: key?.enable,
        dataExpand: key?.dataExpand,
        name: key?.name,
        password: rest?.password,
        port: rest?.port,
        method: rest?.method,
        accessUrl: rest?.accessUrl,
        counterMigrate: CYCLE_PLAN,
      });

      const newGist = await this.gistModal.create({
        code: gist.code,
        gistId: gist._id,
        userId: gist?.userId,
        planId: gist.planId,
        keyId: newKey._id,
        fileName: gist.fileName,
        extension: gist.extension,
        createDate: gist?.createDate,
      });

      // Cập nhật status = 2
      const aws: any = await this.awsModal.findById(key?.awsId?._id);
      await this.keyModal.findByIdAndUpdate(key._id, { status: 2 });
      await this.gistModal.findByIdAndUpdate(gist._id, { status: 2 });
      await this.awsModal.findByIdAndUpdate(aws._id, { status: 2 });

      // Cập nhật lại transaction (extendPlan)
      const listExtendPlan = await this.transactionModal.find({
        gistId: gist._id,
        extendPlanId: { $exists: true },
      });

      for (const extendPlan of listExtendPlan) {
        await this.transactionModal.findByIdAndUpdate(extendPlan._id, {
          gistId: newGist._id,
        });
      }

      // Cập nhật lại transaction (upgradePlan)
      const listUpgradePlan = await this.transactionModal.find({
        gistId: gist._id,
        planId: { $exists: true },
        description: { $regex: 'Gia hạn', $options: 'i' },
      });

      for (const upgradePlan of listUpgradePlan) {
        await this.transactionModal.findByIdAndUpdate(upgradePlan._id, {
          gistId: newGist._id,
        });
      }

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

  private escapeRegex(input) {
    return input.replace(/[^\w\s]/gi, '').replace(' ', '.+');
  }

  async findAll(req: any) {
    try {
      // type: 1 - expire today
      // type: 2 - buy today
      // type: 3 - over banwidth today
      const startToday = new Date();
      startToday.setHours(0, 0, 0, 0);
      const endToday = new Date();
      endToday.setHours(23, 59, 59, 999);

      let query = {};

      const pageSize = req.query.pageSize || 10;
      const page = req.query.page || 1;
      const skip = Number(pageSize) * (page - 1);
      const take = Number(pageSize);

      query = {
        ...(req?.query?.serverId && {
          serverId: req.query.serverId,
        }),

        ...(req?.query?.account && {
          account: {
            $regex: req.query.account,
            $options: 'i',
          },
        }),

        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),

        ...(req?.query?.status && {
          status: req.query.status,
        }),
      };

      if (req.query.type === '1') {
        query = {
          ...query,
          endDate: {
            $gte: startToday,
            $lte: endToday,
          },
        };
      }

      if (req.query.type === '2') {
        query = {
          ...query,
          createdAt: {
            $gte: startToday,
            $lte: endToday,
          },
        };
      }

      if (req.query.type === '3') {
        query = {
          ...query,
          $expr: { $gt: ['$dataUsage', '$dataLimit'] },
        };
      }

      const data: any = await this.keyModal
        .find(query)
        .populate('userId')
        .populate('serverId')
        .populate('awsId')
        .skip(skip)
        .limit(take)
        .sort({ startDate: -1 });

      const totalItems = await this.keyModal.find(query).count();

      const totalPage = Math.ceil(totalItems / Number(pageSize));

      return {
        currentPage: Number(page),
        totalPage,
        itemsPerPage: Number(take),
        totalItems,
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllWithOutlineDataUsage(req: any) {
    try {
      // type: 1 - expire today
      // type: 2 - buy today
      // type: 3 - over banwidth today
      const startToday = new Date();
      startToday.setHours(0, 0, 0, 0);
      const endToday = new Date();
      endToday.setHours(23, 59, 59, 999);

      let query = {};

      const pageSize = req.query.pageSize || 10;
      const page = req.query.page || 1;
      const skip = Number(pageSize) * (page - 1);
      const take = Number(pageSize);

      query = {
        ...(req?.query?.serverId && {
          serverId: req.query.serverId,
        }),

        ...(req?.query?.account && {
          account: {
            $regex: req.query.account,
            $options: 'i',
          },
        }),

        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),

        ...(req?.query?.status && {
          status: req.query.status,
        }),
      };

      if (req.query.type === '1') {
        query = {
          ...query,
          endDate: {
            $gte: startToday,
            $lte: endToday,
          },
        };
      }

      if (req.query.type === '2') {
        query = {
          ...query,
          createdAt: {
            $gte: startToday,
            $lte: endToday,
          },
        };
      }

      if (req.query.type === '3') {
        query = {
          ...query,
          $expr: { $gt: ['$dataUsage', '$dataLimit'] },
        };
      }

      const data: any = await this.keyModal
        .find(query)
        .populate('userId')
        .populate('serverId')
        .populate('awsId')
        .skip(skip)
        .limit(take);

      const listResult = [];
      for (const d of data) {
        const outlineVpn = new OutlineVPN({
          apiUrl: d?.serverId?.apiUrl,
          fingerprint: d?.serverId?.fingerPrint,
        });

        const realtimeDataUsage = await this._getDataUsage(
          outlineVpn,
          d?.keyId,
        );
        listResult.push({ ...d.toObject(), realtimeDataUsage });
      }

      const totalItems = await this.keyModal.find(query).count();

      const totalPage = Math.ceil(totalItems / Number(pageSize));

      return {
        currentPage: Number(page),
        totalPage,
        itemsPerPage: Number(take),
        totalItems,
        data: listResult,
      };
    } catch (error) {
      throw error;
    }
  }

  async _getDataUsage(outlineVpn: OutlineVPN, keyId: string) {
    try {
      return await outlineVpn.getDataUserUsage(keyId);
    } catch (error) {
      console.log(error, ' erorr');
      return 0;
    }
  }

  async todayInfo() {
    try {
      const startToday = moment()
        .subtract(1, 'days')
        .startOf('day')
        .format('YYYY-MM-DD hh:mm');
      const endToday = moment()
        .add(1, 'days')
        .startOf('day')
        .format('YYYY-MM-DD hh:mm');

      const expireToday = await this.keyModal
        .find({
          endDate: {
            $gt: new Date(startToday),
            $lt: new Date(endToday),
          },
          status: 1,
        })
        .count();

      const buyToday = await this.keyModal
        .find({
          createDate: {
            $gt: new Date(startToday),
            $lt: new Date(endToday),
          },
          status: 1,
        })
        .count();

      const overbandWidthToday = await this.keyModal
        .find({
          $expr: { $gt: ['$dataUsage', '$dataLimit'] },
          status: 1,
        })
        .count();

      return { expireToday, buyToday, overbandWidthToday };
    } catch (error) {
      throw error;
    }
  }

  async disableByAdmin(id: string) {
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
      await this.keyModal.findByIdAndUpdate(key._id, {
        enableByAdmin: false,
        enable: false,
      });

      return {
        status: HttpStatus.OK,
        message: 'Disable key thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async enableByAdmin(id: string) {
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
      await this.keyModal.findByIdAndUpdate(key._id, {
        enableByAdmin: true,
        enable: true,
      });

      return {
        status: HttpStatus.OK,
        message: 'Enable key thành công',
      };
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

  async updateEndDate(id: string, endDateKeyDto: EndDateKeyDto) {
    try {
      const data = await this.keyModal.findByIdAndUpdate(
        id,
        { endDate: endDateKeyDto.endDate },
        { new: true },
      );
      return {
        status: HttpStatus.OK,
        data,
        message: 'Update end date thành công',
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

      await this.gistModal.findOneAndUpdate(
        { keyId: key._id },
        {
          extension: renameKeyDto.name,
        },
      );

      const data = await this.keyModal.findByIdAndUpdate(
        id,
        { name: renameKeyDto.name },
        { new: true },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật tên thành công',
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
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkExpiredKey() {
    try {
      console.log('start cron check expire key: ', Date.now());
      const amountQueueWating = await this.expriedKeyQueue.count();
      if (amountQueueWating > 200) {
        await this.expriedKeyQueue.clean(0, 100, 'wait');
      }

      let skip = 0;
      const limit = 10;
      let listKey: any = [];

      do {
        listKey = (await this.keyModal
          .find({ status: 1 })
          .skip(skip)
          .limit(limit)
          .populate('serverId')) as any[];

        if (listKey.length > 0) {
          await this.expriedKeyQueue.add('expried-key', { data: listKey });
        }
        skip += limit;
      } while (listKey.length > 0);
      console.log('finnish cron check expire key: ', Date.now());
    } catch (error) {
      throw error;
    }
  }

  async _handleExpriedKeyCore(listKey: any) {
    const today = moment();
    const expiredKeys = listKey.filter((key) => {
      const endDate = moment(key.endDate);
      return endDate.isBefore(today);
    });
    for (const key of expiredKeys) {
      await this.remove(key._id);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async checkExpireDataExpandKey() {
    try {
      console.log('start cron check expire data expand key: ', Date.now());
      const amountQueueWating = await this.expriedDataExpandQueue.count();
      if (amountQueueWating > 200) {
        await this.expriedDataExpandQueue.clean(0, 100, 'wait');
      }

      let skip = 0;
      const limit = 10;
      let listKey: any = [];
      const today = moment();
      do {
        listKey = await this.keyModal
          .find({ status: 1 })
          .skip(skip)
          .limit(limit)
          .populate('serverId');
        if (listKey.length > 0) {
          await this.expriedDataExpandQueue.add('expried-data-expand-key', {
            data: listKey,
          });
        }

        skip += limit;
      } while (listKey.length > 0);
      console.log('finnish cron check expire data expand key: ', Date.now());
    } catch (error) {}
  }

  private async rollBackDataExpand(key: any) {
    try {
      const outlineVpn = new OutlineVPN({
        apiUrl: key.serverId.apiUrl,
        fingerprint: key.serverId.fingerPrint,
      });

      const data = key.dataLimit + 5 * 1000000000;

      await outlineVpn.addDataLimit(key.keyId, data);

      await this.keyModal.findByIdAndUpdate(key._id, {
        dataExpand: data,
        enable: true,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async _handleExpriedDataExpandKey(listKey: any) {
    const today = moment();
    const expiredKeys = listKey.filter((key) => {
      const endExpandDate = moment(key.endExpandDate);
      return endExpandDate.isBefore(today);
    });
    for (const key of expiredKeys) {
      await this.rollBackDataExpand(key);
    }
  }
}
