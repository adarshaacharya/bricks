import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassHasherModule } from 'src/pass-hasher/pass-hasher.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { UserModule } from 'src/user/user.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { VerificationTokenService } from './verification-token/verification-token.service';
import { JwtTokenService } from './jwt-token/jwt-token.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    GoogleStrategy,
    AccessTokenStrategy,
    ConfigService,
    RefreshTokenStrategy,
    VerificationTokenService,
    JwtTokenService,
  ],
  controllers: [AuthController],
  imports: [
    PassHasherModule,
    UserModule,
    PrismaModule,
    MailerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_JWT_KEY'),
        signOptions: {
          expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
})
export class AuthModule {}
