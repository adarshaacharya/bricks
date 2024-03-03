import { JWTPayload } from 'src/auth/interfaces/jwt.interface';
import { Request } from '@nestjs/common';

export type AuthRequestType = {
  user: JWTPayload;
} & Request;
