import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsJWT()
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
