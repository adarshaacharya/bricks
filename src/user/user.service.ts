import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsers() {
    try {
      const users = await this.prismaService.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
      return users;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async updateUser(id: string, data: UpdateUserDto) {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id,
        },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async deleteUser(id: string) {
    try {
      await this.prismaService.user.delete({
        where: {
          id,
        },
      });
      return null;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
