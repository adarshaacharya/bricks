import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, Matches } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    type: String,
    description: 'Schedule date',
    example: '2021-12-31',
    required: true,
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    type: String,
    description: 'Schedule time',
    example: '12:00',
    required: true,
  })
  @IsString()
  @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
  time: string;

  @ApiProperty({
    type: String,
    description: 'Property ID',
    example: '1',
    required: true,
  })
  @IsString()
  propertyId: string;
}
