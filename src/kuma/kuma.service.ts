import { Injectable } from '@nestjs/common';
import { UpdateKumaDto } from './dto/update-kuma.dto';
import puppeteer, { Page } from 'puppeteer';

type KumaBody = {
  hostname: string;
  port: string;
  msg: string;
};

const UP = 'Up';
const DOWN = 'Down';
@Injectable()
export class KumaService {
  private extractInfo(data: KumaBody) {
    const msgPattern = /^\[([cm][^\]]*)\] \[(🔴|✅) (Down|Up)\]/;
    const match = data.msg.match(msgPattern);

    if (match) {
      const status = match[3];
      return {
        hostname: data.hostname,
        status: status,
      };
    } else {
      return null;
    }
  }

  private async _initBroswer() {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      ignoreHTTPSErrors: true,
      protocolTimeout: 30000,
      args: [
        '--disable-web-security',
        `--ignore-certificate-errors`,
        `--disable-notifications`,
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    return { browser, page };
  }

  private async _handleLogin(page: Page) {
    // Handle Login
    await page.goto('http://143.198.210.178:3001/dashboard');

    // Input Username
    await page.waitForSelector('input[autocomplete="username"]');
    await page.type('input[autocomplete="username"]', 'admin');

    // Input password
    await page.waitForSelector('input[autocomplete="current-password"]');
    await page.type('input[autocomplete="current-password"]', 'admin@123');

    // Button login
    await page.waitForSelector('[type="submit"]');
    await page.click('[type="submit"]');
  }

  monitor(monitorKumaDto: any) {
    const kumaBody = {
      hostname: monitorKumaDto?.monitor?.hostname,
      port: monitorKumaDto?.monitor?.port,
      msg: monitorKumaDto?.msg,
    };

    const result = this.extractInfo(kumaBody);

    if (result) {
      if (result.status === UP) {
        console.log(result, 'up');
      } else if (result.status === DOWN) {
        console.log(result, 'down');
      }
      // UPDATE SERVER STATUS
    } else {
    }

    return 'This action adds a new kuma';
  }

  async create(crateKumaDto: any) {
    const { browser, page } = await this._initBroswer();
    await this._handleLogin(page);
    try {
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
    }
  }

  findAll() {
    return `This action returns all kuma`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kuma`;
  }

  update(id: number, updateKumaDto: UpdateKumaDto) {
    return `This action updates a #${id} kuma`;
  }

  remove(id: number) {
    return `This action removes a #${id} kuma`;
  }
}
