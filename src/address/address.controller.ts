import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiOperation({
    summary: 'Create address',
    description: 'Create address to get listed on real estate site',
  })
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    return {
      success: true,
      message: 'create_address',
      data: await this.addressService.getOrCreateAddress(createAddressDto),
    };
  }
}
