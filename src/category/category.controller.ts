import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

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
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.Admin)
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

  @Get('/:slug/properties')
  @ApiOperation({
    summary: 'Get all properties of a category',
    description:
      'retrieves all the properties that belong to a specific category',
  })
  async getPropertiesByCategory(@Param('slug') slug: string) {
    return {
      success: true,
      message: 'get_properties_by_category',
      data: await this.categoryService.getPropertiesByCategory(slug),
    };
  }
}
