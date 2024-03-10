import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { CategoryService } from 'src/category/category.service';
import { AddressService } from 'src/address/address.service';

@Injectable()
export class PropertyService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly prismaService: PrismaService,
    private readonly addressService: AddressService,
  ) {}

  async createProperty(createPropertyDto: CreatePropertyDto) {
    try {
      const address = await this.addressService.getOrCreateAddress(
        createPropertyDto.address,
      );

      const category = await this.categoryService.getOrCreateCategory(
        createPropertyDto.category,
      );

      return await this.prismaService.property.create({
        data: {
          addressId: address.id,
          size: createPropertyDto.size,
          categoryId: category.id,
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
}
