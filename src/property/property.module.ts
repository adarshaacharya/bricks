import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryModule } from 'src/category/category.module';
import { AddressModule } from 'src/address/address.module';

@Module({
  exports: [PropertyService],
  providers: [PropertyService],
  controllers: [PropertyController],
  imports: [PrismaModule, CategoryModule, AddressModule],
})
export class PropertyModule {}
