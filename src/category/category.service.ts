import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SlugProvider } from './slug.provider';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slugProvider: SlugProvider,
  ) {}

  async getAllCategories() {
    try {
      return await this.prismaService.category.findMany();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async createCategory(name: string) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: {
          name,
        },
      });

      if (category) {
        throw new Error('Category already exists');
      }

      const categorySlug = await this.slugProvider.slugify(name);

      return await this.prismaService.category.create({
        data: {
          name,
          slug: categorySlug,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getPropertiesByCategory(slug: string) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: {
          slug,
        },
        include: {
          properties: true,
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category.properties;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
