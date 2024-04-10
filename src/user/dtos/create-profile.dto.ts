import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, IsUrl, Length } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    type: String,
    description: 'First name',
    example: 'John',
    required: true,
  })
  @IsString()
  @Length(1, 255)
  firstName: string;

  @ApiProperty({
    type: String,
    description: 'Last name',
    example: 'Doe',
    required: true,
  })
  @IsString()
  @Length(1, 255)
  lastName: string;

  @ApiProperty({
    type: String,
    description: 'bio',
    example: 'I am a software engineer',
    required: false,
  })
  @IsString()
  @Length(1, 255)
  bio: string;

  @ApiProperty({
    type: Date,
    description: 'birth date',
    example: '1990-01-01',
    required: false,
  })
  @IsISO8601({
    strict: true,
  })
  birthDate: Date;

  @ApiProperty({
    type: String,
    description: 'avatar',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  avatar: string;
}
