import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Post()
  @ApiOperation({
    summary: 'Create address',
    description: 'Create address to get listed on real estate site',
  })
  @ApiOkResponse({
    type: CreateAddressDto,
    description: 'Create address to get listed on real estate site',
  })
  @ApiConsumes('application/json')
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.getOrCreateAddress(createAddressDto);
  }
}
