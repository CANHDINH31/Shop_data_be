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

type KumaBody = {
  hostname: string;
  port: string;
  msg: string;
};

type ChannelType = 'GROUP' | 'MANAGE' | 'CLIENT' | 'PING';
type TypeChannelType = 'group' | 'port' | 'ping';

type ChannelBody = {
  type: TypeChannelType;
  name: string;
  hostname?: string;
  port?: string;
  group?: string;
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
      name: createKumaDto.name + '-' + createKumaDto?.hostname,
    });

    await page.waitForNavigation();
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/add`);
    await this._handleCreateCore(page, 'CLIENT', {
      type: 'port',
      name: `c-${createKumaDto.name}-${createKumaDto?.hostname}`,
      hostname: createKumaDto.hostname,
      port: createKumaDto.portC,
      group: createKumaDto.name,
    });

    await page.waitForNavigation();
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/add`);
    await this._handleCreateCore(page, 'MANAGE', {
      type: 'port',
      name: `m-${createKumaDto.name}-${createKumaDto?.hostname}`,
      hostname: createKumaDto.hostname,
      port: createKumaDto.portM,
      group: createKumaDto.name,
    });

    await page.waitForNavigation();
    await page.goto(`${this.configService.get('KUMA_DOMAIN')}/add`);
    await this._handleCreateCore(page, 'PING', {
      type: 'ping',
      name: `p-${createKumaDto.name}-${createKumaDto?.hostname}`,
      hostname: createKumaDto.hostname,
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
      if (type !== 'PING') {
        await page.waitForSelector('input[id="port"]');
        await page.type('input[id="port"]', channelBody.port);
      }

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
        (option) =>
          option.text === channelBody?.group + '-' + channelBody?.hostname,
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

  async monitor(monitorKumaDto: any) {
    try {
      const kumaBody = {
        hostname: monitorKumaDto?.monitor?.hostname,
        port: monitorKumaDto?.monitor?.port,
        msg: monitorKumaDto?.msg,
      };

      const result = this.extractInfo(kumaBody);

      if (result && result.status === DOWN) {
        // { hostname: '139.59.108.224', status: 'Down' }
        // Update status down server
        const downServer = await this.serverModal.findOneAndUpdate(
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

      return 'This action adds a new kuma';
    } catch (error) {
      console.log(error);
    }
  }

  async create(createKumaDto: CreateKumaDto) {
    const { browser, page } = await this._initBroswer();
    try {
      await this._handleLogin(page);
      await page.waitForNavigation();
      await this._handleCreateChannel(page, createKumaDto);
      await this.serverModal.findOneAndUpdate(
        {
          hostnameForAccessKeys: createKumaDto.hostname,
        },
        { isConnectKuma: 1 },
      );
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
