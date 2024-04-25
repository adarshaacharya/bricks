import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgottenPasswordEmailDto {
  @ApiProperty({
    example: 'email@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;
}
