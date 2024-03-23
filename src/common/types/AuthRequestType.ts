import { JWTPayload } from 'src/auth/interfaces/jwt.interface';
import { Request as NestRequest } from '@nestjs/common';

export type AuthRequestType = {
  user: JWTPayload;
} & typeof NestRequest;
