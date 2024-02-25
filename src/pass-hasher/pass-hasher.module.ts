import { Module } from '@nestjs/common';
import { PassHasherService } from './pass-hasher.service';

@Module({
  providers: [PassHasherService],
  exports: [PassHasherService],
})
export class PassHasherModule {}
