import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { AuthRequestType } from 'src/common/types/auth-reqest.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags('Schedule')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create schedule',
    description: 'Create schedule to view property',
  })
  @UseGuards(AccessTokenGuard)
  async createSchedule(
    @Request() req: AuthRequestType,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    return this.scheduleService.createSchedule(createScheduleDto, req.user.id);
  }

  @Get('/property/:id')
  @ApiOperation({
    summary: 'Get all schedules for property',
    description: 'Get all schedules for property',
  })
  async getSchedules(@Param('id') propertyId: string) {
    return this.scheduleService.getSchedules(propertyId);
  }
}
