import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    description: 'Category name',
    example: 'Real Estate',
  })
  @IsString()
  name: string;
}
