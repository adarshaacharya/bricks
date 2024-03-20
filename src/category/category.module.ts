import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlugProvider } from './slug.provider';

@Module({
  exports: [CategoryService],
  controllers: [CategoryController],
  providers: [CategoryService, SlugProvider],
  imports: [PrismaModule],
})
export class CategoryModule {}
