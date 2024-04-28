import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'hello@gmail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @ApiResponseProperty({
    type: String,
    example: 'eyJhbGciasdassd ...',
  })
  @IsString()
  @Expose()
  accessToken: string;

  @ApiResponseProperty({
    type: String,
    example: 'eyJhbGciasdassd ...',
  })
  @IsString()
  @Expose()
  refreshToken: string;
}
