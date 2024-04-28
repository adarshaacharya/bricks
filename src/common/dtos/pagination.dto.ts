import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';
import {
  Expose,
  Type,
  ClassConstructor,
  TransformFnParams,
  Transform,
} from 'class-transformer';

export class PaginationMeta {
  @ApiProperty({
    type: Number,
    description: 'The total number of results found',
  })
  @IsInt()
  @Expose()
  readonly total: number;

  @ApiProperty({
    type: Number,
    description: 'The limit of the query',
  })
  @IsInt()
  @Expose()
  limit: number;

  @ApiProperty({
    type: Number,
    description: 'The offset of the query',
  })
  @IsInt()
  @Expose()
  offset: number;
}

export interface IPaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export function PaginationFactory<T>(
  classType: ClassConstructor<T>,
): ClassConstructor<IPaginatedResponse<T>> {
  class PaginationHost implements IPaginatedResponse<T> {
    @ApiProperty({
      type: () => classType,
      isArray: true,
      description: 'Array of the response type found',
    })
    @Expose()
    @Type(() => classType)
    items: T[];

    @Expose()
    @ApiProperty({
      type: PaginationMeta,
      description: 'The metadata of the query',
    })
    meta: PaginationMeta;
  }

  return PaginationHost;
}

export class PaginationQueryParams {
  @Expose()
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(
    (value: TransformFnParams) => (value?.value ? parseInt(value.value) : 0),
    {
      toClassOnly: true,
    },
  )
  offset?: number;

  @Expose()
  @ApiPropertyOptional({
    type: Number,
    example: 10,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Transform(
    (value: TransformFnParams) => (value?.value ? parseInt(value.value) : 10),
    {
      toClassOnly: true,
    },
  )
  limit?: number;
}
