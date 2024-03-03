import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { REFRESH_TOKEN } from '../consts';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get('REFRESH_TOKEN_JWT_KEY'),
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      REFRESH_TOKEN in req.cookies &&
      req.cookies[REFRESH_TOKEN].length > 0
    ) {
      return req.cookies[REFRESH_TOKEN];
    }
    return null;
  }

  async validate(request: any, payload: any) {
    if (!payload) throw new Error('Invalid token');

    return payload;
  }
}
