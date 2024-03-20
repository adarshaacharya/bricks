import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { SearchPropertyDto } from './dtos/search-property.dto';

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

  @Get()
  @ApiOperation({
    summary: 'Get all properties',
    description: 'retrieves all real estate properties in the database',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async getProperties(@Query() query: SearchPropertyDto) {
    const offset = +query.offset || 0;
    const limit = +query.limit || 10;

    if (query) {
      return {
        success: true,
        message: 'get_properties',
        data: await this.propertyService.findPropertyByQuery(query),
      };
    }

    return {
      success: true,
      message: 'get_properties',
      data: await this.propertyService.getProperties(offset, limit),
    };
  }
}
