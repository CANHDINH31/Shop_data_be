import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { KeysService } from './keys.service';

@Processor('expried-key')
export class ExpriedKeyConsumer extends WorkerHost {
  constructor(private readonly keysService: KeysService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.keysService._handleExpriedKeyCore(job.data.data);
  }
}

@Processor('expried-data-expand-key')
export class ExpriedDataExpandKey extends WorkerHost {
  constructor(private readonly keysService: KeysService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.keysService._handleExpriedDataExpandKey(job.data.data);
  }
}
