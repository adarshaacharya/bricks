import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PinoLogger } from 'nestjs-pino';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(UserService.name);
  }

  async getUsers() {
    try {
      const users = await this.prismaService.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
      return users;
    } catch (error) {
      this.logger.error(error);
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
          role: true,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async findByProviderId(providerId: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          providerId,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error);
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
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async createUserProfile(createProfileDto: CreateProfileDto, id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.profile) {
        throw new Error('Profile already exists');
      }

      this.logger.info(`Creating profile for user ${id}`);

      const profile = await this.prismaService.profile.create({
        data: {
          ...createProfileDto,
          birthDate: createProfileDto.birthDate
            ? new Date(createProfileDto.birthDate)
            : null,
          user: {
            connect: {
              id,
            },
          },
        },
      });

      return profile;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async updateUserProfile(
    updateProfileDto: UpdateProfileDto,
    id: string,
    userId: string,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.profile) {
        throw new Error('Profile not found');
      }

      if (user.profile.userId !== id) {
        throw new Error('Profile not found');
      }

      this.logger.info(`Updating profile for user ${id}`);

      const profile = await this.prismaService.profile.update({
        where: {
          id: user.profile.id,
        },
        data: {
          ...updateProfileDto,
          birthDate: updateProfileDto.birthDate
            ? new Date(updateProfileDto.birthDate)
            : null,
        },
      });

      return profile;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async updateUserRole(role: UserRole, id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      this.logger.info(`Updating role for user ${id}`);

      const updatedUser = await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          role: role,
        },
      });

      return updatedUser;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
