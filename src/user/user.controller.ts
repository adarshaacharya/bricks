import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthRequestType } from 'src/common/types/auth-reqest.types';
import {
  CreateProfileDto,
  CreateProfileResponseDto,
} from './dtos/create-profile.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { MeResponseDto } from './dtos/me-reponse.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import {
  UpdateProfileDto,
  UpdateProfileResponseDto,
} from './dtos/update-profile.dto';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Post('/profile')
  @ApiOperation({
    summary: 'Create user',
    description: 'Create new user',
  })
  @UseGuards(AccessTokenGuard)
  @Serialize(CreateProfileResponseDto)
  async createProfile(
    @Request() req: AuthRequestType,
    @Body() data: CreateProfileDto,
  ): Promise<CreateProfileResponseDto> {
    return await this.userService.createUserProfile(data, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch('/profile/:id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user by id',
  })
  @Serialize(UpdateProfileResponseDto)
  async updateUserProfile(
    @Request() req: AuthRequestType,
    @Param('id') profileId: string,
    @Body() data: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    return await this.userService.updateUserProfile(
      data,
      profileId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users queries',
    description: 'Get all users queries',
  })
  async getUsers() {
    return await this.userService.getUsers();
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get me',
    description: 'Get current user data',
  })
  @ApiResponse({
    status: 200,
    type: MeResponseDto,
  })
  @Serialize(MeResponseDto)
  async me(@Request() req: AuthRequestType): Promise<MeResponseDto> {
    const me = await this.userService.getUserById(req.user.id);

    return me;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get user data by id',
  })
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete user by id',
  })
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Patch(':id/role')
  @ApiOperation({
    summary: 'Update user role',
    description: 'Update user role by id',
  })
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return await this.userService.updateUserRole(role, id);
  }
}
