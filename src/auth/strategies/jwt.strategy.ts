import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWTPayload } from './../interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN } from '../consts';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_TOKEN_JWT_KEY'),
    });
  }

  private static extractJWT(req: Request): string | null {
    // uncomment this if you want to use the authorization header to send the token
    // const authHeader = req.headers.authorization;

    // if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    //   return authHeader.split(' ')[1];
    // }

    if (
      req.cookies &&
      ACCESS_TOKEN in req.cookies &&
      req.cookies[ACCESS_TOKEN].length > 0
    ) {
      return req.cookies[ACCESS_TOKEN];
    }

    return null;
  }

  /**
   Passport first verifies the JWT's signature and decodes the JSON.
    It then invokes our validate() method passing the decoded JSON as its single parameter.
     Based on the way JWT signing works, we're guaranteed that we're receiving a valid token
      that we have previously signed and issued to a valid user.
   */
  async validate(decodedJwtPayload: JWTPayload) {
    if (!decodedJwtPayload)
      throw new UnauthorizedException(
        'Invalid token, please login to obtain the correct token',
      );

    return decodedJwtPayload; // this will get attached to the request object as req.user and can be accessed in the route handler
  }
}
