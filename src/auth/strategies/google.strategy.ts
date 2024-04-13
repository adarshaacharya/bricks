import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PinoLogger } from 'nestjs-pino';
import { Profile, Strategy } from 'passport-google-oauth20';
import { EnvironmentVariables } from 'src/common/config/configuration';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { AuthProvider, UserRole } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_OAUTH_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
    this.logger.setContext(GoogleStrategy.name);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { id, displayName, emails, photos, name } = profile;
    this.logger.assign({ googleId: id });
    this.logger.info('Finding user with google id');
    const existingUser = await this.userService.findByProviderId(id);

    if (!existingUser) {
      this.logger.info('Could not find user, creating him/her.');

      const newUser = await this.authService.signup({
        email: emails?.[0].value || '',
        providerId: id,
        provider: AuthProvider.Google,
        role: UserRole.Client, // The users role is set to client by default
      });

      this.logger.info('User created', {
        userId: newUser.id,
        email: newUser.email,
        providerId: newUser.providerId,
        provider: newUser.provider,
      });

      await this.userService.createUserProfile(
        {
          firstName: name?.givenName,
          lastName: name?.familyName,
          avatar: photos?.[0].value,
        },
        newUser.id,
      );

      this.logger.info('New User profile created', {
        userId: newUser.id,
        firstName: name?.givenName,
        lastName: name?.familyName,
        avatar: photos?.[0].value,
      });
      return newUser; // req.user will see this object
    }

    this.logger.info('User found', {
      userId: existingUser.id,
      email: existingUser.email,
      providerId: existingUser.providerId,
      provider: existingUser.provider,
    });

    return existingUser;
  }
}
