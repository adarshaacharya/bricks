import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthRequestType } from 'src/types/AuthRequestType';

@ApiBearerAuth('authorization')
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users queries',
    description: 'Get all users queries',
  })
  async getUsers() {
    return {
      success: true,
      message: 'get_users',
      data: await this.userService.getUsers(),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user data',
  })
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return {
      success: true,
      message: 'update_user',
      data: await this.userService.updateUser(id, data),
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get me',
    description: 'Get current user data',
  })
  async me(@Request() req: AuthRequestType) {
    return {
      success: true,
      message: 'me',
      data: await this.userService.getUserById(req.user.id),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get user data by id',
  })
  async getUserById(@Param('id') id: string) {
    return {
      success: true,
      message: 'get_user',
      data: await this.userService.getUserById(id),
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete user by id',
  })
  async deleteUser(@Param('id') id: string) {
    return {
      success: true,
      message: 'delete_user',
      data: await this.userService.deleteUser(id),
    };
  }
}
