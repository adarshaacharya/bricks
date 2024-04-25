import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dtos/create-address.dto';

export class CreatePropertyDto {
  @ApiProperty({
    type: String,
    description: 'Property title',
    example: 'New property',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Property description',
    example: 'This is a new property',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: Number,
    description: 'Property price',
    example: 100000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Property value',
    example: 100000,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    type: Number,
    description: 'Property area',
    example: 100,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    type: Boolean,
    description: 'Property is sold',
    example: false,
  })
  @IsBoolean()
  sold: boolean;

  @ApiProperty({
    type: CreateAddressDto,
    description: 'Property address',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({
    type: String,
    description: 'Property category',
    example: 'Real Estate',
  })
  @IsString()
  category: string;
}
