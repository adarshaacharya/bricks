import { ApiResponseProperty, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginationFactory } from 'src/common/dtos/pagination.dto';
import { CreatePropertyDto } from './create-property.dto';
import { Address, Category } from '@prisma/client';

export class PropertyResponseDto extends PickType(CreatePropertyDto, [
  'title',
  'description',
  'price',
  'size',
  'sold',
]) {
  @Expose()
  @ApiResponseProperty({
    example: '23123123',
    type: String,
  })
  id: string;

  @Expose()
  @ApiResponseProperty({
    example: 'category',
    type: String,
  })
  category: Category;

  @Expose()
  @ApiResponseProperty({
    example: 'address',
    type: String,
  })
  address: Address;
}

export class PaginatedPropertyResponseDto extends PaginationFactory<PropertyResponseDto>(
  PropertyResponseDto,
) {}
