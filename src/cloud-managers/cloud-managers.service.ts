import { Injectable } from '@nestjs/common';
import { CreateCloudManagerDto } from './dto/create-cloud-manager.dto';
import { UpdateCloudManagerDto } from './dto/update-cloud-manager.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CloudManager } from 'src/schemas/cloudManagers.schema';
import { Model } from 'mongoose';
import { Server } from 'src/schemas/servers.schema';
import * as moment from 'moment';
import { TotalCostDto } from './dto/total-cost.dto';
import { UpdateStatusCloudManagerDto } from './dto/update-status-cloud-manager.dto';

@Injectable()
export class CloudManagersService {
  constructor(
    @InjectModel(CloudManager.name)
    private cloudManagerModal: Model<CloudManager>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
  ) {}

  async totalCost(totalCostDto: TotalCostDto) {
    try {
      const startOfMonth = moment(totalCostDto.month)
        .startOf('month')
        .format('YYYY-MM-DD hh:mm');
      const endOfMonth = moment(totalCostDto.month)
        .endOf('month')
        .format('YYYY-MM-DD hh:mm');

      const cost = await this.cloudManagerModal.aggregate([
        {
          $match: {
            isDelete: 1,
            startDate: {
              $gte: new Date(startOfMonth),
              $lte: new Date(endOfMonth),
            },
          },
        },
        { $group: { _id: 'null', price: { $sum: '$price' } } },
      ]);

      return { cost: cost?.[0]?.price };
    } catch (error) {
      throw error;
    }
  }

  async create(createCloudManagerDto: CreateCloudManagerDto) {
    try {
      return await this.cloudManagerModal.create({ ...createCloudManagerDto });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: any) {
    try {
      const query = {
        isDelete: 1,
        ...(req?.query?.name && {
          name: { $regex: req.query.name, $options: 'i' },
        }),
        ...(req?.query?.key && {
          key: { $regex: req.query.key, $options: 'i' },
        }),
        ...(req?.query?.remark && {
          remark: { $regex: req.query.remark, $options: 'i' },
        }),
      };

      const listCloudManagers = await this.cloudManagerModal.find(query);
      const listData = [];
      for (const cloudManager of listCloudManagers) {
        const server = await this.serverModal.countDocuments({
          cloudManagerId: cloudManager._id,
        });
        const startDate = moment(
          moment(cloudManager.startDate).format('YYYY-MM-DD'),
        );

        const today = moment();

        const endDate = moment(
          moment(cloudManager.endDate).format('YYYY-MM-DD'),
        );

        const dieDate = cloudManager?.dieDate
          ? moment(moment(cloudManager.dieDate).format('YYYY-MM-DD'))
          : null;

        const valid = endDate.diff(startDate, 'days');
        const remain = endDate.diff(today, 'days');
        const live = cloudManager?.dieDate
          ? dieDate.diff(startDate, 'days')
          : null;

        listData.push({
          ...cloudManager?.toObject(),
          valid,
          server,
          remain,
          live,
        });
      }

      const totalCost = await this.cloudManagerModal.aggregate([
        { $match: query },
        { $group: { _id: 'null', price: { $sum: '$price' } } },
      ]);

      return { totalCost: totalCost?.[0]?.price, listData };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const cloudManager = await this.cloudManagerModal.findById(id);
      const server = await this.serverModal.countDocuments({
        cloudManagerId: cloudManager._id,
      });

      const startDate = moment(
        moment(cloudManager.startDate).format('YYYY-MM-DD'),
      );
      const endDate = moment(moment(cloudManager.endDate).format('YYYY-MM-DD'));

      const remain = endDate.diff(startDate, 'days');

      return { ...cloudManager?.toObject(), server, remain };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCloudManagerDto: UpdateCloudManagerDto) {
    try {
      return await this.cloudManagerModal.findByIdAndUpdate(
        id,
        { ...updateCloudManagerDto },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(
    id: string,
    updateStatusCloudManagerDto: UpdateStatusCloudManagerDto,
  ) {
    try {
      if (updateStatusCloudManagerDto.status == 1) {
        return await this.cloudManagerModal.findByIdAndUpdate(
          id,
          {
            status: 1,
            $unset: { dieDate: '' },
          },
          { new: true },
        );
      } else {
        return await this.cloudManagerModal.findByIdAndUpdate(
          id,
          {
            status: 0,
            dieDate: new Date(),
          },
          { new: true },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.cloudManagerModal.findByIdAndUpdate(id, {
        isDelete: 0,
      });
    } catch (error) {
      throw error;
    }
  }
}
