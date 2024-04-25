import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { SlugProvider } from 'src/category/slug.provider';
import { SearchPropertyDto } from './dtos/search-property.dto';
import { Prisma, Property } from '@prisma/client';
import { CacheSystemService } from 'src/cache-system/cache-system.service';
import { REDIS_KEYS } from 'src/common/constants';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PropertyService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cache: CacheSystemService,
    private readonly slugProvider: SlugProvider,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(PropertyService.name);
  }

  async createProperty(createPropertyDto: CreatePropertyDto) {
    try {
      const property = await this.prismaService.property.create({
        data: {
          title: createPropertyDto.title,
          description: createPropertyDto.description,
          price: createPropertyDto.price,
          sold: createPropertyDto.sold,
          address: {
            connectOrCreate: {
              where: {
                id: createPropertyDto.address.id,
                city: createPropertyDto.address.city,
                state: createPropertyDto.address.state,
                street: createPropertyDto.address.street,
                zip: createPropertyDto.address.zip,
                country: createPropertyDto.address.country,
              },
              create: {
                city: createPropertyDto.address.city,
                state: createPropertyDto.address.state,
                street: createPropertyDto.address.street,
                zip: createPropertyDto.address.zip,
                country: createPropertyDto.address.country,
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

      if (!property) {
        this.logger.error('Property not created');
        throw new Error('Property not created');
      }

      await this.cache.invalidateCache(REDIS_KEYS.PROPERTY);

      return property;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getProperties(offset: number, limit: number) {
    const cacheKey = `${REDIS_KEYS.PROPERTY}:${offset}:${limit}`;

    const cachedData = await this.cache.get<{
      properties: Property[];
      total: number;
      limit: number;
      offset: number;
    }>(cacheKey);

    if (cachedData) {
      return {
        data: cachedData.properties,
        total: cachedData.total,
        limit: cachedData.limit,
        offset: cachedData.offset,
      };
    }

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

      const propertiesCount = await this.prismaService.property.count();

      const data = {
        properties,
        total: propertiesCount,
        limit: limit || 10,
        offset: offset || 0,
      };

      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async findPropertyByQuery(query: SearchPropertyDto) {
    const { categories, offset, limit, sold } = query;
    const cacheKey = `${REDIS_KEYS.PROPERTY}:${categories}:${offset}:${limit}:${sold}`;

    const cachedData = await this.cache.get<{
      properties: Property[];
      total: number;
      limit: number;
      offset: number;
    }>(cacheKey);

    if (cachedData) {
      return {
        data: cachedData.properties,
        total: cachedData.total,
        limit: cachedData.limit,
        offset: cachedData.offset,
      };
    }

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

      const totalProperties = await this.prismaService.property.count();

      const data = {
        properties,
        total: totalProperties,
        limit: limit || 10,
        offset: offset || 0,
      };

      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      this.logger.error(error);

      throw new Error(error);
    }
  }

  async findPropertyById(id: string) {
    const cacheKey = `${REDIS_KEYS.PROPERTY}:${id}`;
    const dataCache = await this.cache.get(cacheKey);
    if (dataCache) return dataCache;

    try {
      const property = await this.prismaService.property.findUnique({
        where: {
          id: id,
        },
        include: {
          address: true,
          category: true,
          schedules: true,
        },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      this.cache.set(cacheKey, property);

      return property;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
