import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

@Module({
  providers: [PropertyService],
  controllers: [PropertyController]
})
export class PropertyModule {}
