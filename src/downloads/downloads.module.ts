import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Download, DownloadSchema } from 'src/schemas/downloads.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Download.name, schema: DownloadSchema },
    ]),
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService],
})
export class DownloadsModule {}
