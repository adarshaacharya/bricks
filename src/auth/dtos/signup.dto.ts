import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { AuthProvider, UserRole } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // password is optional because it is not required for social login but required for local login

  @ApiProperty({
    enum: UserRole,
    example: UserRole.Client,
    description: 'The role of the user',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    example: 'google-oauth2|1234567890',
    description: 'The providerId of the user',
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    enum: AuthProvider,
    example: AuthProvider.Google || AuthProvider.Github,
    description: 'The provider of the user',
  })
  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;
}

export class SignupResponseDto {
  @ApiResponseProperty({
    example: 'djaskjdasd',
    type: String,
  })
  @Expose()
  @IsUUID()
  id: string;

  @ApiResponseProperty({
    example: 'user@email.com',
    type: String,
  })
  @Expose()
  @IsEmail()
  email: string;

  @ApiResponseProperty({
    enum: UserRole,
    example: UserRole.Client,
    type: String,
  })
  @Expose()
  role: UserRole;
}
