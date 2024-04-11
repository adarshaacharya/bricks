import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaHealthIndicator } from 'src/prisma/prisma.health';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule], // http module is needed for the HttpHealthIndicator
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, PrismaService],
})
export class HealthModule {}
