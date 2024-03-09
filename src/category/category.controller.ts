import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'retrieves all the real estate categories that exist in the database',
  })
  async getAllCategories() {
    return {
      success: true,
      message: 'get_categories',
      data: await this.categoryService.getAllCategories(),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a category',
    description:
      'send a category name and receives a category with name and id.',
  })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return {
      success: true,
      message: 'create_category',
      data: await this.categoryService.createCategory(createCategoryDto.name),
    };
  }
}
