import { Injectable, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllCategories() {
    try {
      return await this.prismaService.category.findMany();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  @UseGuards(AccessTokenGuard)
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

      return await this.prismaService.category.create({
        data: {
          name,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}