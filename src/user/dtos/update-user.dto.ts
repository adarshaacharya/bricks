import { PartialType, PickType } from '@nestjs/swagger';
import { SignupDto } from 'src/auth/dtos/signup';

export class UpdateUserDto extends PickType(PartialType(SignupDto), [
  'name',
] as const) {}
