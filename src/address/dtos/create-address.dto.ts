import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    type: String,
    description: 'Property address',
    example: '1234 Elm Street',
    required: true,
  })
  @IsString()
  street: string;

  @ApiProperty({
    type: String,
    description: 'Property city',
    example: 'Springfield',
    required: true,
  })
  @IsString()
  city: string;

  @ApiProperty({
    type: String,
    description: 'Property state',
    example: 'IL',
    required: true,
  })
  @IsString()
  state: string;

  @ApiProperty({
    type: Number,
    description: 'Property zip code',
    example: 62704,
    required: true,
  })
  @IsNumber()
  zip: number;
}
