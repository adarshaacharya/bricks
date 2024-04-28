import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateProfileDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'First name',
    example: 'John',
    required: true,
  })
  @IsString()
  @Length(1, 255)
  firstName: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Last name',
    example: 'Doe',
    required: true,
  })
  @IsString()
  @Length(1, 255)
  lastName: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'bio',
    example: 'I am a software engineer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  bio?: string;

  @Expose()
  @ApiProperty({
    type: Date,
    description: 'birth date',
    example: '1990-01-01',
    required: false,
  })
  @IsISO8601({
    strict: true,
  })
  @IsOptional()
  birthDate?: Date;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'avatar',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatar: string;
}

export class CreateProfileResponseDto extends CreateProfileDto {
  @ApiProperty({
    type: String,
    description: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;
}
