import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { GistsModule } from './gists/gists.module';
import { ServersModule } from './servers/servers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ContactsModule } from './contacts/contacts.module';
import { DownloadsModule } from './downloads/downloads.module';
import { CashsModule } from './cashs/cashs.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ExtendPlansModule } from './extend-plans/extend-plans.module';
import { CommisionsModule } from './commisions/commisions.module';
import { RosesModule } from './roses/roses.module';
import { UpgradesModule } from './upgrades/upgrades.module';
import { SatisfyModule } from './satisfy/satisfy.module';
import { CollabModule } from './collab/collab.module';
import { KeysModule } from './keys/keys.module';
import { MailerModule } from '@nest-modules/mailer';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_DATABASE_URL'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"VPN" <${configService.get('MAIL_FROM')}>`,
        },
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PlansModule,
    GistsModule,
    ServersModule,
    ContactsModule,
    DownloadsModule,
    CashsModule,
    TransactionsModule,
    ExtendPlansModule,
    CommisionsModule,
    RosesModule,
    UpgradesModule,
    SatisfyModule,
    CollabModule,
    KeysModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer;
  }
}
