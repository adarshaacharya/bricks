export interface JWTPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export interface JWTPayloadRefreshToken {
  id: string;
}
