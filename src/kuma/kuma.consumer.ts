import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { KumaService } from './kuma.service';

@Processor('kuma-monitor')
export class KumaMonitorConsumer extends WorkerHost {
  constructor(private readonly kumaService: KumaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.kumaService._handleMonitorCore(job.data.data);
  }
}
