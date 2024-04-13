import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { EnvironmentVariables } from 'src/common/config/configuration';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, UserRole } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_OAUTH_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_OAUTH_CALLBACK_URL'),
      scope: ['read:user', 'user:email'],
    });
    this.logger.setContext(GithubStrategy.name);
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, username, emails, name, displayName } = profile;

    this.logger.assign({ githubId: id, githubUsername: username });
    this.logger.info('Finding user with github id');
    const existingUser = await this.userService.findByProviderId(id);

    if (!existingUser) {
      this.logger.info('Could not find user, creating him/her.');

      const newUser = await this.authService.signup({
        email: emails?.[0].value || '',
        providerId: id,
        provider: AuthProvider.Github,
        role: UserRole.Client, // The users role is set to client by default
      });

      this.logger.info('User created', {
        userId: newUser.id,
        email: newUser.email,
        providerId: newUser.providerId,
        provider: newUser.provider,
      });

      const [firstName, lastName] = name?.givenName?.split(' ') || [
        displayName,
        '',
      ];

      await this.userService.createUserProfile(
        {
          firstName: firstName,
          lastName: lastName,
          avatar: profile.photos?.[0].value,
        },
        newUser.id,
      );

      this.logger.info('User profile created', {
        userId: newUser.id,
        firstName: name?.givenName || displayName,
        lastName: name?.familyName || '',
        avatar: profile.photos?.[0].value,
      });

      return newUser; // req.user will be set to this object
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
