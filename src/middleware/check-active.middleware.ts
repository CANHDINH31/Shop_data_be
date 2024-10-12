import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigDatabaseService } from './config-database.service';

@Injectable()
export class CheckActiveMiddleware implements NestMiddleware {
  constructor(private readonly configDatabaseService: ConfigDatabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isActive = await this.configDatabaseService.isActive();

    if (isActive && isActive.value === '0') {
      throw new HttpException('Service is disabled', HttpStatus.FORBIDDEN);
    }

    next();
  }
}
