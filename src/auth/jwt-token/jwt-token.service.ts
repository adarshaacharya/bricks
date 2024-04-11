import {
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';
import { EnvironmentVariables } from 'src/common/config/configuration';
import { JWTPayload } from '../interfaces/jwt.interface';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(JwtTokenService.name);
  }

  /**
   * Decodes a JWT token and retrieves the payload data.
   *
   * @param token - The JWT token to be decoded.
   * @returns The decoded payload as an object of type `JWTPayload`.
   */
  _decodeToken<T>(token: string): T | null {
    try {
      if (!token) {
        throw new ForbiddenException('No token provided');
      }

      return this.jwtService.decode(token) as T;
    } catch (error) {
      this.logger.error('Error decoding token:', error);
      throw error;
    }
  }

  /**
   * Generates authentication and refresh tokens based on the given payload.
   *
   * @param payload - The payload containing the data to be included in the tokens.
   * @returns An object containing the authentication and refresh tokens.
   */
  async _createTokens(payload: JWTPayload) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('ACCESS_TOKEN_JWT_KEY'),
          expiresIn: this.configService.get<string>(
            'ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('REFRESH_TOKEN_JWT_KEY'),
          expiresIn: this.configService.get<string>(
            'REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(error);

      throw new MethodNotAllowedException('Token creation failed');
    }
  }
}
