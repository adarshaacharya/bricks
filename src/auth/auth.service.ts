import {
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PassHasherService } from 'src/pass-hasher/pass-hasher.service';
import { SignupDto } from './dtos/signup';
import { User } from '@prisma/client';
import { JWTPayload } from './interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly passwordHasher: PassHasherService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      const { email, name, password, role } = signupDto;

      const exists = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (exists) {
        throw new Error('User already exists');
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
        },
      });
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword,
        message: 'User created successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create user' + error,
      };
    }
  }

  async login(user: User) {
    const tokens = await this._createTokens({
      id: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    });

    return tokens;
  }

  async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new Error('User does not exist');
      }

      const isPasswordValid = await this.passwordHasher.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Refreshes the authentication token for a user session.
   *
   * @param userId - The ID of the user.
   * @param token - The current authentication token.
   * @returns The new authentication token.
   */
  async refreshToken(refreshToken: string) {
    try {
      const decodedToken = this._decodeToken(refreshToken);

      const { email, id } = decodedToken;

      const tokens = await this._createTokens({
        email,
        id,
        iat: Math.floor(Date.now() / 1000),
      });

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Decodes a JWT token and retrieves the payload data.
   *
   * @param token - The JWT token to be decoded.
   * @returns The decoded payload as an object of type `JWTPayload`.
   */
  private _decodeToken(token: string): JWTPayload | null {
    try {
      if (!token) {
        throw new ForbiddenException('No token provided');
      }

      return this.jwtService.decode(token) as JWTPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw error;
    }
  }

  /**
   * Generates authentication and refresh tokens based on the given payload.
   *
   * @param payload - The payload containing the data to be included in the tokens.
   * @returns An object containing the authentication and refresh tokens.
   */
  private async _createTokens(payload: JWTPayload) {
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
      console.error(error);

      throw new MethodNotAllowedException('Token creation failed');
    }
  }
}
