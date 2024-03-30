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
import { EnvironmentVariables } from 'src/common/config/configuration';
import { PinoLogger } from 'nestjs-pino';
import { MailerService } from 'src/mailer/mailer.service';
import { v4 as uuidv4 } from 'uuid';
import { SignupVerifyEmailDto } from 'src/mailer/template.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly passwordHasher: PassHasherService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: PinoLogger,
    private readonly mailerService: MailerService,
  ) {
    logger.setContext(AuthService.name);
  }

  async signup(signupDto: SignupDto) {
    try {
      const { email, password, role } = signupDto;

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
          password: hashedPassword,
          role,
        },
      });
      const { password: _, ...userWithoutPassword } = user;

      const verification = await this.createVerificationCode(user);

      const recipient = { to: [user.email] };

      const mail = new SignupVerifyEmailDto({
        email: user.email,
        verificationCode: verification.code,
      });

      console.log({
        mail,
        recipient,
      });

      await this.mailerService.sendEmailFromTemplate(mail, recipient);

      return userWithoutPassword;
    } catch (error) {
      this.logger.error(error);

      throw new Error(error);
    }
  }

  async login(user: User) {
    const tokens = await this._createTokens({
      id: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      roles: [user.role],
    });

    return tokens;
  }

  async getAuthenticatedUser(email: string, password: string) {
    this.logger.info(
      `Authenticating user with email: ${email} and password : ${password}`,
    );
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
      this.logger.error((error as Error).message);
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

      const { email, id, roles } = decodedToken;

      const tokens = await this._createTokens({
        email,
        id,
        iat: Math.floor(Date.now() / 1000),
        roles,
      });

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      this.logger.error(error);
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
      this.logger.error(error);

      throw new MethodNotAllowedException('Token creation failed');
    }
  }

  async verifyEmail(code?: string) {
    try {
      if (!code) {
        throw new Error('No verification code provided');
      }

      this.logger.info(`Verifying email with code: ${code}`);
      const verification = await this.prisma.verification.findFirst({
        where: {
          code: code,
        },
        include: {
          user: true,
        },
      });

      if (!verification) {
        throw new Error('Invalid verification code');
      }

      if (verification.user.verified) {
        throw new Error('User already verified');
      }

      this.logger.info(`User found: ${verification.user}`);

      if (verification.expiresAt < new Date()) {
        throw new Error('Verification code expired');
      }

      await this.prisma.user.update({
        where: {
          id: verification.userId,
        },
        data: {
          verified: true,
          verification: null,
        },
      });

      await this.prisma.verification.delete({
        where: {
          id: verification.id,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async createVerificationCode(user: User) {
    try {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
      const code = uuidv4(); // Generate a random code

      const otp = await this.prisma.verification.create({
        data: {
          userId: user.id,
          code,
          expiresAt,
        },
      });

      this.logger.info(
        `Verification code created: ${otp.code} and send to email ${user.email}`,
      );

      return otp;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
