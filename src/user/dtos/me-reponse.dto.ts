import { ApiResponseProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class MeResponseDto {
  @Expose()
  @ApiResponseProperty({
    example: '23123123',
    type: String,
  })
  @IsUUID()
  id: string;

  @Expose()
  @ApiResponseProperty({
    example: 'email@gmail.com',
    type: String,
  })
  email: string;

  @Expose()
  @ApiResponseProperty({
    enum: UserRole,
    example: UserRole.Client,
  })
  role: UserRole;
}
