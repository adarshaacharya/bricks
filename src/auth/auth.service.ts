import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassHasherService } from 'src/pass-hasher/pass-hasher.service';
import { SignupDto } from './dtos/signup.dto';
import { User } from '@prisma/client';
import { JWTPayload } from './interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/config/configuration';
import { PinoLogger } from 'nestjs-pino';
import { MailerService } from 'src/mailer/mailer.service';
import {
  SignupVerifyEmailDto,
  ForgotPasswordMailDto,
} from 'src/mailer/template.interface';
import { ForgottenPasswordEmailDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/recovery-password.dto';
import { EMAIL_EXPIRATION_TIME } from './consts';
import { v4 as uuidv4 } from 'uuid';
import { JwtTokenService } from './jwt-token/jwt-token.service';
import { VerificationTokenService } from './verification-token/verification-token.service';
import { ChangePasswordDto } from './dtos/change-passowrd.dto';

const CLIENT_ROUTES = {
  verify: '/signup/verify',
  RESET_PASSWORD: '/auth/reset-password',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PassHasherService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: PinoLogger,
    private readonly mailerService: MailerService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly verificationTokenService: VerificationTokenService,
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

      await this.sendAccountVerificationEmail(user.email);

      return userWithoutPassword;
    } catch (error) {
      this.logger.error(error);

      throw new Error(error);
    }
  }

  async sendAccountVerificationEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const code = uuidv4();

      const verificationToken =
        await this.verificationTokenService.createVerificationToken(
          user.email,
          code,
        );

      await this.prisma.verification.create({
        data: {
          code: code,
          userId: user.id,
          expiresAt: new Date(Date.now() + EMAIL_EXPIRATION_TIME),
        },
      });

      const recipient = { to: [user.email] };

      const link = `${this.configService.get(
        'CLIENT_DOMAIN',
      )}/${CLIENT_ROUTES.verify}/${verificationToken}`;

      const mail = new SignupVerifyEmailDto({
        email: user.email,
        verificationRedirectLink: link,
      });

      await this.mailerService.sendEmailFromTemplate(mail, recipient);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async login(user: User) {
    const tokens = await this.jwtTokenService._createTokens({
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
      const decodedToken =
        this.jwtTokenService._decodeToken<JWTPayload>(refreshToken);

      const { email, id, roles } = decodedToken;

      const tokens = await this.jwtTokenService._createTokens({
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

  async activateAccountAfterSignup(code?: string) {
    try {
      if (!code) {
        throw new Error('No verification code provided');
      }

      this.logger.info(`Verifying email with code: ${code}`);

      const verification = await this.prisma.verification.findFirst({
        where: {
          code: code,
        },
      });

      if (!verification) {
        throw new BadRequestException('Invalid verification code');
      }

      if (verification.expiresAt < new Date()) {
        throw new ForbiddenException('Token has expired');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: verification.userId,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.verified) {
        throw new BadRequestException('User already verified');
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verified: true,
        },
      });

      await this.prisma.verification.delete({
        where: {
          id: verification.id,
        },
      });

      this.logger.info(
        `User ${user.email} verified successfully and token deleted`,
      );

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgottenPasswordEmailDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: forgotPasswordDto.email,
        },
      });

      if (!user) {
        throw new NotFoundException("User with this email doesn't exist");
      }

      const code = uuidv4();

      const verificationToken =
        await this.verificationTokenService.createVerificationToken(
          user.email,
          code,
        );

      await this.prisma.verification.create({
        data: {
          code: code,
          userId: user.id,
          expiresAt: new Date(Date.now() + EMAIL_EXPIRATION_TIME),
        },
      });

      const recipient = { to: [user.email] };

      const link = `${this.configService.get('CLIENT_DOMAIN')}/${
        CLIENT_ROUTES.RESET_PASSWORD
      }/${verificationToken}`;

      const mail = new ForgotPasswordMailDto({
        email: user.email,
        verificationRedirectLink: link,
      });

      await this.mailerService.sendEmailFromTemplate(mail, recipient);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async updateForgottenPassword(resetPasswordDto: ResetPasswordDto) {
    const { confirmPassword, password, token } = resetPasswordDto;

    try {
      const verification = await this.prisma.verification.findFirst({
        where: {
          code: token,
        },
      });

      if (!verification) {
        throw new UnprocessableEntityException(
          'failed to verify reset password link',
        );
      }

      if (verification.expiresAt < new Date()) {
        throw new ForbiddenException('Token has expired');
      }

      if (password !== confirmPassword) {
        throw new ConflictException('Passwords do not match');
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      const user = await this.prisma.user.update({
        where: {
          id: verification.userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      await this.prisma.verification.delete({
        where: {
          id: verification.id,
        },
      });

      this.logger.info(`New password set for user ${user.email}`);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
    const { confirmPassword, password, oldPassword } = changePasswordDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isOldPasswordValid = await this.passwordHasher.comparePassword(
        oldPassword,
        user.password,
      );

      if (!isOldPasswordValid) {
        throw new ForbiddenException('Invalid old password');
      }

      if (password !== confirmPassword) {
        throw new ConflictException('Passwords do not match');
      }

      const hashedPassword = await this.passwordHasher.hashPassword(password);

      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      this.logger.info(`Password changed for user ${user.email}`);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async resendVerificationEmail(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.sendAccountVerificationEmail(user.email);
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
