import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSchedule(createScheduleDto: CreateScheduleDto, userId: string) {
    try {
      const existingSchedule = await this.prismaService.schedule.findFirst({
        where: {
          date: new Date(createScheduleDto.date),
          time: createScheduleDto.time,
          propertyId: createScheduleDto.propertyId,
        },
      });

      if (existingSchedule) {
        throw new Error(
          'Schedule already exists for this date and time. Please choose another date or time.',
        );
      }

      return await this.prismaService.schedule.create({
        data: {
          date: new Date(createScheduleDto.date),
          time: createScheduleDto.time,
          property: {
            connect: {
              id: createScheduleDto.propertyId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getSchedules(propertyId: string) {
    try {
      return await this.prismaService.schedule.findMany({
        where: {
          propertyId,
        },
        include: {
          property: true,
          user: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
