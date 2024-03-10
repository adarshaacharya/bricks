import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    type: String,
    description: 'Property address',
    example: '1234 Elm Street',
  })
  @IsString()
  street: string;

  @ApiProperty({
    type: String,
    description: 'Property city',
    example: 'Springfield',
  })
  @IsString()
  city: string;

  @ApiProperty({
    type: String,
    description: 'Property state',
    example: 'IL',
  })
  @IsString()
  state: string;

  @ApiProperty({
    type: Number,
    description: 'Property zip code',
    example: 62704,
  })
  @IsNumber()
  zip: number;
}
