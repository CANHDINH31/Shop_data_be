import { Module } from '@nestjs/common';
import { KumaService } from './kuma.service';
import { KumaController } from './kuma.controller';

@Module({
  controllers: [KumaController],
  providers: [KumaService]
})
export class KumaModule {}
