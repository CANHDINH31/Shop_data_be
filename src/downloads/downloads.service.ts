import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Download } from 'src/schemas/downloads.schema';
import { Model } from 'mongoose';
import { SyncDownloadDto } from './dto/sync-download.dto';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectModel(Download.name) private downloadModal: Model<Download>,
  ) {}

  async sync(syncDownloadDto: SyncDownloadDto) {
    try {
      const download = await this.downloadModal.findOne({});
      if (download) {
        await this.downloadModal.findByIdAndUpdate(
          download._id,
          syncDownloadDto,
        );
      } else {
        await this.downloadModal.create(syncDownloadDto);
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Đồng bộ thành công thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async find() {
    try {
      return await this.downloadModal.findOne();
    } catch (error) {
      throw error;
    }
  }
}
