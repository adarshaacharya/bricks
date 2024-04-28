import { ApiResponseProperty, PartialType } from '@nestjs/swagger';
import {
  CreateProfileDto,
  CreateProfileResponseDto,
} from './create-profile.dto';
import { User, UserRole } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}

export class UpdateProfileResponseDto extends PartialType(
  CreateProfileResponseDto,
) {
  @Expose()
  @ApiResponseProperty({
    example: {
      id: '23123123',
      email: 'email@gmail.com',
      role: UserRole.Client,
    },
  })
  user: User;
}
