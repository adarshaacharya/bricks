import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { CategoryService } from 'src/category/category.service';
import { AddressService } from 'src/address/address.service';
import { SlugProvider } from 'src/category/slug.provider';
import { SearchPropertyDto } from './dtos/search-property.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PropertyService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly prismaService: PrismaService,
    private readonly addressService: AddressService,

    private readonly slugProvider: SlugProvider,
  ) {}

  async createProperty(createPropertyDto: CreatePropertyDto) {
    try {
      return await this.prismaService.property.create({
        data: {
          address: {
            connectOrCreate: {
              where: {
                city: createPropertyDto.address.city,
                state: createPropertyDto.address.state,
                street: createPropertyDto.address.street,
                zip: createPropertyDto.address.zip,
              },
              create: {
                city: createPropertyDto.address.city,
                state: createPropertyDto.address.state,
                street: createPropertyDto.address.street,
                zip: createPropertyDto.address.zip,
              },
            },
          },
          size: createPropertyDto.size,
          category: {
            connectOrCreate: {
              where: {
                name: createPropertyDto.category,
              },
              create: {
                name: createPropertyDto.category,
                slug: await this.slugProvider.slugify(
                  createPropertyDto.category,
                ),
              },
            },
          },
        },
        include: {
          address: true,
          category: true,
          schedules: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getProperties(offset: number, limit: number) {
    try {
      const skipCount = Math.floor((+offset || 0) - 1) * (+limit || 10);

      const properties = await this.prismaService.property.findMany({
        skip: skipCount <= 0 ? 0 : skipCount,
        take: limit || 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          address: true,
          category: true,
          schedules: true,
        },
      });

      const data = {
        properties,
        total: await this.prismaService.property.count(),
        limit: limit || 10,
        offset: offset || 0,
      };
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async findPropertyByQuery(query: SearchPropertyDto) {
    const { categories, offset, limit, sold } = query;

    try {
      const where: Prisma.PropertyWhereInput = {};

      const skipCount = Math.floor((+offset || 0) - 1) * (+limit || 10);
      if (categories && categories.length > 0) {
        where['category'] = {
          name: {
            in: categories,
          },
        };
      }

      if (sold) {
        where['sold'] = Boolean(sold) || false;
      }

      const properties = await this.prismaService.property.findMany({
        skip: skipCount <= 0 ? 0 : skipCount,
        take: +limit || 10,
        where: {
          OR: [where],
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          address: true,
          category: true,
          schedules: true,
        },
      });

      const data = {
        properties,
        total: await this.prismaService.property.count(),
        limit: limit || 10,
        offset: offset || 0,
      };

      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
