import { json } from 'express';
import { Injectable } from '@nestjs/common';
import { UpdateKumaDto } from './dto/update-kuma.dto';
import puppeteer, { Page } from 'puppeteer';
import { CreateKumaDto } from './dto/create-kuma.dto';
import { ConfigService } from '@nestjs/config';
import { RemoveKumaDto } from './dto/remove-kuma.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Server } from 'src/schemas/servers.schema';
import { Key } from 'src/schemas/keys.schema';
import { Model } from 'mongoose';
import { KeysService } from 'src/keys/keys.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { HttpService } from '@nestjs/axios';

type KumaBody = {
  hostname: string;
  port: string;
  msg: string;
};

const DOWN = 'Down';
const MAXRETRIES = '5';

@Injectable()
export class KumaService {
  constructor(
    private configService: ConfigService,
    private readonly keyService: KeysService,
    @InjectModel(Key.name) private keyModal: Model<Key>,
    @InjectModel(Server.name) private serverModal: Model<Server>,
    @InjectQueue('kuma-monitor') private kumaMonitorQueue: Queue,
    private readonly httpService: HttpService,
  ) {}
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
      protocolTimeout: 60000,
      timeout: 0,
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
    await page.screenshot({ path: 'uploads/screenshot1.png' });

    // Handle Login
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/dashboard`);

    await page.screenshot({ path: 'uploads/screenshot2.png' });

    // Input Username
    await page.waitForSelector('input[autocomplete="username"]');
    await page.type(
      'input[autocomplete="username"]',
      this.configService.get('KUMA_USERNAME'),
    );

    await page.screenshot({ path: 'uploads/screenshot3.png' });

    // Input password
    await page.waitForSelector('input[autocomplete="current-password"]');
    await page.type(
      'input[autocomplete="current-password"]',
      this.configService.get('KUMA_PASSWORD'),
    );

    await page.screenshot({ path: 'uploads/screenshot4.png' });

    // Button login
    await page.waitForSelector('[type="submit"]');
    await page.click('[type="submit"]');
  }

  async monitor(monitorKumaDto: any) {
    try {
      const kumaBody = {
        hostname: monitorKumaDto?.monitor?.hostname,
        port: monitorKumaDto?.monitor?.port,
        msg: monitorKumaDto?.msg,
      };

      const result = this.extractInfo(kumaBody);
      await this.kumaMonitorQueue.add('kuma-monitor', {
        data: result,
      });

      return 'This action adds a new kuma';
    } catch (error) {
      console.log(error);
    }
  }

  async _handleMonitorCore(result: any) {
    try {
      if (result && result.status === DOWN) {
        // { hostname: '139.59.108.224', status: 'Down' }
        // Update status down server
        const downServer = await this.serverModal.findOne({
          hostnameForAccessKeys: result.hostname,
        });
        if (downServer.status == 2) return;
        await this.serverModal.findOneAndUpdate(
          {
            hostnameForAccessKeys: result.hostname,
          },
          { status: 2 },
        );
        // // Migrate key to maintain server
        const maintainServer = await this.serverModal.findOne({ status: 3 });
        if (maintainServer) {
          const listKey = await this.keyModal.find({
            serverId: downServer?._id?.toString(),
            status: 1,
          });
          for (const key of listKey) {
            await this.keyService.migrate({
              keyId: key._id?.toString(),
              serverId: maintainServer?._id?.toString(),
            });
          }
        } else {
          console.log('not found maintain server');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async create(createKumaDto: CreateKumaDto) {
    const formData = new FormData();
    formData.append('username', this.configService.get('KUMA_USERNAME'));
    formData.append('password', this.configService.get('KUMA_PASSWORD'));
    try {
      // const res = await this.httpService.axiosRef.post(
      //   this.configService.get('KUMA_DOMAIN') + '/login/access-token',
      //   formData,
      // );

      // const token = res.data.access_token;

      const token =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3Mjc0MjQyNzIsInN1YiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeWJtRnRaU0k2SW1Ga2JXbHVJaXdpYUNJNkltWTNNVEF3T1dGaE9UVXhOV1pqTmpBMk5HRmxObVE0TnpreE1UUm1OVEl5SWl3aWFXRjBJam94TnpJMk56TXpNRGN5ZlEuTXliblk2cndvUTZwcWNOR0tYRVowTGs2T3l6aEExVWd2NW9HQTRLbjZaOCJ9.FpAHDnXDsmb9Z4jZjGkTGc5R94EtWjpWB00yYzLp_JY';

      const payload = {
        type: 'port',
        name: `c-${createKumaDto.name}-${createKumaDto.hostname}`,
        interval: 30,
        retryInterval: 30,
        resendInterval: 0,
        maxretries: 6,
        upsideDown: false,
        url: 'https://',
        expiryNotification: false,
        ignoreTls: false,
        maxredirects: 10,
        port: createKumaDto.portC,
        accepted_statuscodes: ['200-299'],
        method: 'GET',
        authMethod: 'basic',
        hostname: createKumaDto.hostname,
        dns_resolve_server: '1.1.1.1',
        dns_resolve_type: 'A',
        mqttUsername: '',
        mqttPassword: '',
      };

      const monitorRes = await this.httpService.axiosRef.post(
        this.configService.get('KUMA_DOMAIN') + '/monitors',
        payload,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return monitorRes;
    } catch (err) {
      throw err;
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

  private async _handleSearch(page: Page, name: string) {
    await page.waitForSelector('input[class="form-control search-input"]');
    await page.type('input[class="form-control search-input"]', '');
    await page.type('input[class="form-control search-input"]', name);
  }

  private async _handleRemove(page: Page) {
    await page.waitForSelector('div[class="monitor-list scrollbar"]');
    const listMonitorWrapper = await page.$(
      'div[class="monitor-list scrollbar"]',
    );

    if (listMonitorWrapper) {
      await page.waitForSelector('a[data-v-574bc50a]', { timeout: 500 });
      const listHrefs = await listMonitorWrapper.$$eval(
        'a[data-v-574bc50a]',
        (els) => els?.map((el) => el.getAttribute('href'))?.reverse(),
      );

      const removePromises = listHrefs.map((href) =>
        this._handleRemoveCore(page, href),
      );
      await Promise.all(removePromises);
    }
  }

  private async _handleRemoveCore(page: Page, href: string) {
    const newPage = await page.browser().newPage();
    try {
      await newPage.goto(this.configService.get('KUMA_DOMAIN') + href);

      await newPage.waitForSelector('button[class="btn btn-danger"]');
      await newPage.click('button[class="btn btn-danger"]');

      await newPage.waitForSelector('div[class="modal fade show"]');
      const modelActive = await newPage.$('div[class="modal fade show"]');
      if (modelActive) {
        await modelActive.waitForSelector(
          'button[class="btn btn-danger"][data-bs-dismiss="modal"]',
        );
        const buttonSubmit = await modelActive.$(
          'button[class="btn btn-danger"][data-bs-dismiss="modal"]',
        );

        if (buttonSubmit) {
          await buttonSubmit.click();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      await newPage.close();
    }
  }

  private async _remove(removeKumaDto: RemoveKumaDto) {
    const { browser, page } = await this._initBroswer();

    try {
      await this._handleLogin(page);
      await page.waitForNavigation();
      await this._handleSearch(page, removeKumaDto.name);
      await this._handleRemove(page);
    } catch (error) {
    } finally {
      await browser.close();
    }
  }

  async remove(removeKumaDto: RemoveKumaDto) {
    let numRetries = 1;
    while (numRetries < Number(MAXRETRIES)) {
      await this._remove(removeKumaDto);
      numRetries++;
    }
  }
}
