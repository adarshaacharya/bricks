import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * this strategy is used in login route only to check valid creds or not
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
 We can pass an options object in the call to super()
  to customize the behavior of the passport strategy. 
  In this example, the passport-local strategy by default 
  expects properties called email and password in the request body.
   */
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.getAuthenticatedUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.verified) {
      throw new UnauthorizedException(
        'please verify your email to activate your account',
      );
    }

    return user;
  }
}
