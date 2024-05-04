import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateAddressDto } from './dtos/create-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrCreateAddress(address: CreateAddressDto) {
    try {
      const existingAddress = await this.prismaService.address.findUnique({
        where: {
          id: address.id,
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
        },
      });

      if (existingAddress) {
        return existingAddress;
      }

      return await this.prismaService.address.create({
        data: address,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
