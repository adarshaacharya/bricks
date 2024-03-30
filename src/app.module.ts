import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PassHasherModule } from './pass-hasher/pass-hasher.module';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { CategoryModule } from './category/category.module';
import { AddressModule } from './address/address.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CacheSystemModule } from './cache-system/cache-system.module';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Options } from 'pino-http';
import { MailerModule } from './mailer/mailer.module';

const LoggerModule = PinoLoggerModule.forRoot({
  pinoHttp: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          options: { singleLine: true, colorize: true },
          level: 'trace',
        },
      ],
    },
  } as Options,
  exclude: [{ method: RequestMethod.ALL, path: '/api/health' }],
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    PassHasherModule,
    UserModule,
    PropertyModule,
    CategoryModule,
    AddressModule,
    ScheduleModule,
    CacheSystemModule,
    LoggerModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
