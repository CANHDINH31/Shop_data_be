import { Injectable } from '@nestjs/common';
import { UpdateKumaDto } from './dto/update-kuma.dto';
import puppeteer, { Page } from 'puppeteer';
import { CreateKumaDto } from './dto/create-kuma.dto';
import { ConfigService } from '@nestjs/config';

type KumaBody = {
  hostname: string;
  port: string;
  msg: string;
};

type ChannelType = 'GROUP' | 'MANAGE' | 'CLIENT' | 'PING';
type TypeChannelType = 'group' | 'port';

type ChannelBody = {
  type: TypeChannelType;
  name: string;
  hostname?: string;
  port?: string;
  group?: string;
};

const UP = 'Up';
const DOWN = 'Down';
const MAXRETRIES = '5';
@Injectable()
export class KumaService {
  constructor(private configService: ConfigService) {}
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
      // headless: false,
      headless: 'shell',
      executablePath: '/usr/bin/chromium-browser',
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
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/dashboard`);

    // Input Username
    await page.waitForSelector('input[autocomplete="username"]');
    await page.type(
      'input[autocomplete="username"]',
      this.configService.get('KUMA_USERNAME'),
    );

    // Input password
    await page.waitForSelector('input[autocomplete="current-password"]');
    await page.type(
      'input[autocomplete="current-password"]',
      this.configService.get('KUMA_PASSWORD'),
    );

    // Button login
    await page.waitForSelector('[type="submit"]');
    await page.click('[type="submit"]');
  }

  private async _handleCreateChannel(page: Page, createKumaDto: CreateKumaDto) {
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/add`);
    await this._handleCreateCore(page, 'GROUP', {
      type: 'group',
      name: createKumaDto.name,
    });

    await page.waitForNavigation();
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/add`);
    await this._handleCreateCore(page, 'CLIENT', {
      type: 'port',
      name: `c-${createKumaDto.name}`,
      hostname: createKumaDto.hostname,
      port: createKumaDto.port,
      group: createKumaDto.name,
    });
  }

  private async _handleCreateCore(
    page: Page,
    type: ChannelType,
    channelBody: ChannelBody,
  ) {
    // Choose Chanel
    await page.waitForSelector('select[class="form-select"]');
    const channelSelectE = await page.$('select[class="form-select"]');
    await channelSelectE.select(channelBody.type);

    // Type Name
    await page.waitForSelector('input[id="name"]');
    await page.type('input[id="name"]', channelBody.name);

    if (type !== 'GROUP') {
      // Type Hostname
      await page.waitForSelector('input[id="hostname"]');
      await page.type('input[id="hostname"]', channelBody.hostname);

      // Type Port
      await page.waitForSelector('input[id="port"]');
      await page.type('input[id="port"]', channelBody.port);

      // Type maxRetries
      await page.waitForSelector('input[id="maxRetries"]');
      await page.type('input[id="maxRetries"]', MAXRETRIES);

      // Choose Group
      await page.waitForSelector('select[id="monitorGroupSelector"]');
      const options = await page.$$eval(
        'select[id="monitorGroupSelector"] option',
        (options) =>
          options.map((option) => ({
            value: option.value,
            text: option.textContent,
          })),
      );
      const optionToSelect = options.find(
        (option) => option.text === channelBody?.group,
      );
      if (optionToSelect) {
        await page.select(
          'select[id="monitorGroupSelector"]',
          optionToSelect.value,
        );
      }
    }

    //Submit
    await page.waitForSelector('button[id="monitor-submit-btn"]');
    await page.click('button[id="monitor-submit-btn"]');
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

  async create(createKumaDto: CreateKumaDto) {
    const { browser, page } = await this._initBroswer();
    await this._handleLogin(page);
    await page.waitForNavigation();
    await this._handleCreateChannel(page, createKumaDto);

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
