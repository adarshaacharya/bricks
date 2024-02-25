import { UserRole } from '@prisma/client';
import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
