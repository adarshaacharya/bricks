import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  public readonly token: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  public readonly password: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  public readonly confirmPassword: string;
}
