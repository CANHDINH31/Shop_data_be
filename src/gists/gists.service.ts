import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGistDto } from './dto/create-gist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Gist } from 'src/schemas/gists.schema';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Plan } from 'src/schemas/plans.schema';
import { Server } from 'src/schemas/servers.schema';
import { Key } from 'src/schemas/keys.schema';
import { OutlineVPN } from 'outlinevpn-api';
import { User } from 'src/schemas/users.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { Commision } from 'src/schemas/commisions.schema';
import { Rose } from 'src/schemas/roses.schema';
import { UpdateExtensionGistDto } from './dto/update-extension-gist.dto';
import { Collab } from 'src/schemas/collabs.schema';
import { generateRandomString } from 'src/utils';
import * as AWS from 'aws-sdk';
import { Aws } from 'src/schemas/awses.schema';
import { BackUpGistDto } from './dto/back-gist.dto';

@Injectable()
export class GistsService {
  private readonly S3;

  constructor(
    @InjectModel(Gist.name) private gistModal: Model<Gist>,
    @InjectModel(Plan.name) private planModal: Model<Plan>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Transaction.name) private transactionModal: Model<Transaction>,
    @InjectModel(Commision.name) private commisionModal: Model<Commision>,
    @InjectModel(Rose.name) private roseModal: Model<Rose>,
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

  async create(createGistDto: CreateGistDto) {
    try {
      const commision = await this.commisionModal.findOne({});
      const plan = await this.planModal.findById(createGistDto.planId);
      const user = await this.userModal.findById(createGistDto.userId);

      if (plan.price === 0 && user.level === 0 && user.isFree === 1) {
        throw new BadRequestException({
          message: 'Bạn đã đăng kí gói dùng thử.',
          remark: 400,
        });
      }

      if (Number(plan.price) > Number(user.money))
        throw new BadRequestException({
          message: 'Bạn không đủ tiền để đăng kí dịch vụ này',
        });
      const startDate = moment();
      const endDate = moment().add(plan.day, 'd');
      const randomKey = generateRandomString(4).toLocaleLowerCase();
      const fileName = `${moment(startDate).format('YYYYMMDD')}-${plan.name
        ?.replace(/[^a-zA-Z0-9]/g, '')
        ?.toLowerCase()}-${user.username}-${randomKey}.json`;

      const listServer = await this.serverModal
        .find({ status: 1 })
        .select([
          '_id',
          'hostnameForAccessKeys',
          'portForNewAccessKeys',
          'totalBandWidth',
        ]);
      if (listServer?.length < 1) {
        throw new BadRequestException({
          message: 'Hiện chưa có server nào hoạt động. Vui lòng quay lại sau',
        });
      }
      const keyCountByServerId = [];
      for (const server of listServer) {
        const dataLimit = await this.keyModal.aggregate([
          {
            $match: {
              serverId: new mongoose.Types.ObjectId(server._id),
              status: 1,
            },
          },
          {
            $group: {
              _id: server._id,
              dataLimit: { $sum: '$dataExpand' },
            },
          },
        ]);

        keyCountByServerId.push({
          serverId: server._id,
          dataLimit: dataLimit?.[0]?.dataLimit || 0,
          serverIp: server.hostnameForAccessKeys,
          serverPort: server.portForNewAccessKeys,
          totalBandWidth: server.totalBandWidth,
        });
      }

      // Sắp xếp danh sách keyCountByServerId theo số lượng key tăng dần
      const sortedKeyCountByServerId = keyCountByServerId.sort(
        (a, b) =>
          Number(a.dataLimit) / Number(a.totalBandWidth) -
          Number(b.dataLimit) / Number(b.totalBandWidth),
      );

      // Lấy serverId có ít key nhất
      const leastKeyServerId = sortedKeyCountByServerId[0].serverId;
      const serverMongo = await this.serverModal.findById(leastKeyServerId);
      const outlineVpn = new OutlineVPN({
        apiUrl: serverMongo.apiUrl,
        fingerprint: serverMongo.fingerPrint,
      });

      // Tạo user trên outlineVpn
      const userVpn = await outlineVpn.createUser();
      const { id, ...rest } = userVpn;
      const data = plan.bandWidth * 1000000000;
      await outlineVpn.addDataLimit(id, data);

      // Tạo tên key
      const today = moment().startOf('day');
      const amount = await this.gistModal.countDocuments({
        userId: user._id,
        planId: plan._id,
        createDate: {
          $gte: today.toDate(),
          $lt: moment(today).endOf('day').toDate(),
        },
        status: 1,
      });

      const nameKey = `${plan.name
        ?.replace(/[^a-zA-Z0-9]/g, '')
        ?.toLowerCase()}-${user.username.toLowerCase()}-${moment(
        startDate,
      ).format('YYMMDD')}-${amount + 1}`;

      await outlineVpn.renameUser(id, nameKey);

      // Tạo key trên aws
      const keyAws = await this.S3.upload({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: fileName,
        Body: JSON.stringify({
          server: sortedKeyCountByServerId[0].serverIp,
          server_port: sortedKeyCountByServerId[0].serverPort,
          password: rest.password,
          method: rest.method,
          prefix: '\u0016\u0003\u0001\u0000¨\u0001\u0001',
        }),
        ContentType: 'application/json',
      }).promise();

      // Tạo keyaws mongo
      const keyAwsMongo = await this.awsModal.create({
        awsId: keyAws.Key,
        fileName: keyAws.Location,
        prefix: '\u0016\u0003\u0001\u0000¨\u0001\u0001',
      });

      // Tạo key Mongo
      const key = await this.keyModal.create({
        keyId: id,
        userId: user._id,
        awsId: keyAwsMongo._id,
        account: user.username,
        serverId: leastKeyServerId,
        startDate,
        endDate,
        dataLimit: data,
        dataExpand: data,
        ...rest,
        name: nameKey,
        createDate: moment(),
      });

      // Tạo gist Mongo
      const code = `${moment().format('YYYYMMDD')}-${randomKey}`;

      const gistMongo = await this.gistModal.create({
        ...createGistDto,
        extension: nameKey,
        fileName,
        keyId: key._id,
        code,
        createDate: moment(),
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

      // Tạo giao dịch
      await this.transactionModal.create({
        code,
        userId: createGistDto.userId,
        gistId: gistMongo._id,
        planId: createGistDto.planId,
        money: money,
        discount: disccount,
        description: `Đăng kí gói ${plan.name}`,
      });

      // Trừ tiền tải khoản
      await this.userModal.findByIdAndUpdate(user._id, {
        $inc: { money: -money },
      });

      // Apply commision for user isnot collab
      if (
        commision.value > 0 &&
        user.introduceUserId &&
        user.level === 0 &&
        plan.price > 0
      ) {
        const recive = ((plan.price * commision.value) / 100).toFixed(0);
        await this.roseModal.create({
          code,
          reciveRoseId: user.introduceUserId,
          introducedId: user._id,
          plan: plan.name,
          price: plan.price,
          percent: commision.value,
          recive,
        });
        await this.userModal.findByIdAndUpdate(user.introduceUserId, {
          $inc: { money: recive },
        });
      }

      // update isfree field
      if (plan.price === 0 && user.isFree === 0) {
        await this.userModal.findByIdAndUpdate(user?._id, { isFree: 1 });
      }

      const result = await this.gistModal
        .findById(gistMongo._id)
        .populate('userId')
        .populate('planId')
        .populate({
          path: 'keyId',
          populate: {
            path: 'awsId',
          },
        });

      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới thành công',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: any) {
    let query = {};

    const pageSize = req.query.pageSize || 10;
    const page = req.query.page || 1;
    const skip = Number(pageSize) * (page - 1);
    const take = Number(pageSize);

    query = {
      ...(req?.query?.userId && {
        userId: req.query.userId,
      }),
      ...(req?.query?.status && {
        status: req.query.status,
      }),
      ...(req?.query?.planId && {
        planId: req.query.planId,
      }),
      ...(req?.query?.keyId && {
        keyId: req.query.keyId,
      }),
      ...(req?.query?.extension && {
        extension: { $regex: req.query.extension, $options: 'i' },
      }),
    };

    try {
      const data = await this.gistModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('planId')
        .populate({
          path: 'keyId',
          populate: [{ path: 'awsId' }, { path: 'serverId' }],
        })
        .skip(skip)
        .limit(take);

      const totalItems = await this.gistModal.find(query).count();

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

  async findOne(id: string) {
    try {
      const gistMongo = await this.gistModal
        .findById(id)
        .populate('userId')
        .populate('userId')
        .populate('planId')
        .populate({
          path: 'keyId',
          populate: {
            path: 'awsId',
          },
        });

      return {
        ...gistMongo.toObject(),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateExtension(
    id: string,
    updateExtensionGistDto: UpdateExtensionGistDto,
  ) {
    try {
      const gist: any = await this.gistModal.findById(id).populate({
        path: 'keyId',
        populate: {
          path: 'serverId',
        },
      });

      const keyId = gist.keyId._id;

      const outlineVpn = new OutlineVPN({
        apiUrl: gist.keyId.serverId.apiUrl,
        fingerprint: gist.keyId.serverId.fingerPrint,
      });

      await outlineVpn.renameUser(
        gist.keyId.keyId,
        updateExtensionGistDto.extension,
      );

      await this.keyModal.findByIdAndUpdate(keyId, {
        name: updateExtensionGistDto.extension,
      });

      const updatedGist = await this.gistModal.findByIdAndUpdate(
        id,
        {
          extension: updateExtensionGistDto.extension,
        },
        { new: true },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật thông tin thành công',
        updatedGist,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.gistModal.deleteOne({ _id: id });

      return {
        status: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async backUp(backUpGistDto: BackUpGistDto) {
    try {
      const keyBU = await this.keyModal.findById(backUpGistDto.keyId);
      const aws = await this.awsModal.findById(keyBU.awsId);
      const gist = await this.gistModal.findOne({ keyId: keyBU._id });

      const fileName = aws?.fileName?.split('/').pop();
      const listServer = await this.serverModal
        .find({ status: 1 })
        .select([
          '_id',
          'hostnameForAccessKeys',
          'portForNewAccessKeys',
          'totalBandWidth',
        ]);

      if (listServer?.length < 1) {
        throw new BadRequestException({
          message: 'Hiện chưa có server nào hoạt động. Vui lòng quay lại sau',
        });
      }

      const keyCountByServerId = [];
      for (const server of listServer) {
        const dataLimit = await this.keyModal.aggregate([
          {
            $match: {
              serverId: new mongoose.Types.ObjectId(server._id),
              status: 1,
            },
          },
          {
            $group: {
              _id: server._id,
              dataLimit: { $sum: '$dataExpand' },
            },
          },
        ]);

        keyCountByServerId.push({
          serverId: server._id,
          dataLimit: dataLimit?.[0]?.dataLimit || 0,
          serverIp: server.hostnameForAccessKeys,
          serverPort: server.portForNewAccessKeys,
          totalBandWidth: server.totalBandWidth,
        });
      }

      // Sắp xếp danh sách keyCountByServerId theo số lượng key tăng dần
      const sortedKeyCountByServerId = keyCountByServerId.sort(
        (a, b) =>
          Number(a.dataLimit) / Number(a.totalBandWidth) -
          Number(b.dataLimit) / Number(b.totalBandWidth),
      );

      // Lấy serverId có ít key nhất
      const leastKeyServerId = sortedKeyCountByServerId[0].serverId;
      const serverMongo = await this.serverModal.findById(leastKeyServerId);
      const outlineVpn = new OutlineVPN({
        apiUrl: serverMongo.apiUrl,
        fingerprint: serverMongo.fingerPrint,
      });

      // Tạo user trên outlineVpn
      const userVpn = await outlineVpn.createUser();
      const { id, ...rest } = userVpn;
      await outlineVpn.addDataLimit(id, keyBU?.dataExpand);

      await outlineVpn.renameUser(id, keyBU?.name);

      // Tạo key trên aws
      const keyAws = await this.S3.upload({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: fileName,
        Body: JSON.stringify({
          server: sortedKeyCountByServerId[0].serverIp,
          server_port: sortedKeyCountByServerId[0].serverPort,
          password: rest.password,
          method: rest.method,
          prefix: '\u0016\u0003\u0001\u0000¨\u0001\u0001',
        }),
        ContentType: 'application/json',
      }).promise();

      // Tạo keyaws mongo
      const keyAwsMongo = await this.awsModal.create({
        awsId: keyAws.Key,
        fileName: keyAws.Location,
        prefix: '\u0016\u0003\u0001\u0000¨\u0001\u0001',
      });

      // Tạo key Mongo
      const key = await this.keyModal.create({
        ...rest,
        keyId: id,
        awsId: keyAwsMongo._id,
        serverId: leastKeyServerId,
        name: keyBU?.name,
        enable: keyBU?.enable,
        enableByAdmin: keyBU?.enableByAdmin,
        dataLimit: keyBU?.dataLimit,
        dataUsageYesterday: keyBU?.dataUsageYesterday,
        dataUsage: keyBU?.dataUsage,
        arrayDataUsage: keyBU?.arrayDataUsage,
        dataExpand: keyBU?.dataExpand,
        userId: keyBU?.userId,
        account: keyBU?.account,
        startDate: keyBU?.startDate,
        endDate: keyBU?.endDate,
        createDate: keyBU?.createDate,
        migrateDate: keyBU?.migrateDate,
        counterMigrate: keyBU?.counterMigrate,
      });

      // // Tạo gist Mongo
      await this.gistModal.create({
        userId: gist?.userId,
        planId: gist?.planId,
        extension: gist?.extension,
        fileName: fileName,
        keyId: key._id,
        code: gist?.code,
        createDate: gist?.createDate,
      });
      return 'success';
    } catch (error) {
      throw error;
      console.log(error, 'error');
    }
  }
}
