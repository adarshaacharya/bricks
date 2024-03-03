export interface JWTPayload {
  id: string;
  email: string;
  iat: number;
}

export interface JWTPayloadRefreshToken {
  id: string;
}
