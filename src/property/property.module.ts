import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryModule } from 'src/category/category.module';
import { AddressModule } from 'src/address/address.module';
import { SlugProvider } from 'src/category/slug.provider';
import { CacheSystemModule } from 'src/cache-system/cache-system.module';

@Module({
  exports: [PropertyService],
  providers: [PropertyService, SlugProvider],
  controllers: [PropertyController],
  imports: [PrismaModule, CategoryModule, AddressModule, CacheSystemModule],
})
export class PropertyModule {}
