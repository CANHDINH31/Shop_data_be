import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ServersService } from './servers.service';

@Processor('data-usage')
export class DataUsageConsumer extends WorkerHost {
  constructor(private readonly serversService: ServersService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.serversService._handleCoreGetDataUsage(job.data.data);
  }
}
