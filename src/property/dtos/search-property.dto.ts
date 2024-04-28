import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/common/dtos/pagination.dto';

export class SearchPropertyDto extends PaginationQueryParams {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional()
  categories?: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sold?: string;
}
