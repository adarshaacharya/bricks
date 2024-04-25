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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthRequestType } from 'src/common/types/AuthRequestType';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@ApiBearerAuth('authorization')
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/profile')
  @ApiOperation({
    summary: 'Create user',
    description: 'Create new user',
  })
  @UseGuards(AccessTokenGuard)
  async crteateProfile(
    @Request() req: AuthRequestType,
    @Body() data: CreateProfileDto,
  ) {
    return await this.userService.createUserProfile(data, req.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/profile/:id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user by id',
  })
  async updateUserProfile(
    @Request() req: AuthRequestType,
    @Param('id') id: string,
    @Body() data: CreateProfileDto,
  ) {
    return await this.userService.updateUserProfile(data, id, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users queries',
    description: 'Get all users queries',
  })
  async getUsers() {
    return await this.userService.getUsers();
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get me',
    description: 'Get current user data',
  })
  async me(@Request() req: AuthRequestType) {
    return await this.userService.getUserById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get user data by id',
  })
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete user by id',
  })
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

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
