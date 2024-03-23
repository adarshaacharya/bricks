import { Module } from '@nestjs/common';
import { CacheSystemService } from './cache-system.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    PrismaModule,
    RedisModule.forRoot({
      readyLog: true,
      config: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
      },
    }),
  ],
  providers: [CacheSystemService],
  exports: [CacheSystemService],
})
export class CacheSystemModule {}
