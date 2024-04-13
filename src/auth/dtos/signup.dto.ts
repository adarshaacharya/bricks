import { AuthProvider, UserRole } from '@prisma/client';
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // password is optional because it is not required for social login but required for local login

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;
}
