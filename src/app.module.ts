import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
