import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { SearchPropertyDto } from './dtos/search-property.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import {
  PaginatedPropertyResponseDto,
  PropertyResponseDto,
} from './dtos/property-response.dto';

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
    return await this.propertyService.createProperty(createPropertyDto);
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
  @Serialize(PaginatedPropertyResponseDto)
  async getProperties(
    @Query() query: SearchPropertyDto,
  ): Promise<PaginatedPropertyResponseDto> {
    const offset = query.offset || 0;
    const limit = query.limit || 10;

    if (query.categories || query.sold) {
      return await this.propertyService.findPropertyByQuery(query);
    }

    return await this.propertyService.getProperties(offset, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get property by id',
    description: 'retrieves a real estate property by id',
  })
  @Serialize(PropertyResponseDto)
  async getPropertyById(@Param('id') id: string) {
    return this.propertyService.findPropertyById(id);
  }
}
