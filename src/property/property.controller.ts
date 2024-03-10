import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiOperation({
    summary: 'Create property',
    description: 'Create property to get listed on real estate site',
  })
  async createProperty(@Body() createPropertyDto: CreatePropertyDto) {
    return {
      success: true,
      message: 'create_property',
      data: await this.propertyService.createProperty(createPropertyDto),
    };
  }
}
