import { UserRole } from '@prisma/client';

export interface JWTPayload {
  id: string;
  email: string;
  iat: number;
  roles: UserRole[];
}

export interface JWTPayloadRefreshToken {
  id: string;
}
