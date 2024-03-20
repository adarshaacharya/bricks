import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class SearchPropertyDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  offset?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  limit?: string;

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
