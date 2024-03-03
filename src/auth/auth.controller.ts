import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup';
import { LocalAuthGuard } from './guards/local-auth.guard';
import AccessTokenAuthGuard from './guards/access-token.guard';
import { Response } from 'express';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACESS_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from './consts';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Request() req, @Res() res: Response) {
    const response = await this.authService.login(req.user);

    res.cookie(ACCESS_TOKEN, response.accessToken, {
      maxAge: ACESS_TOKEN_COOKIE_MAX_AGE,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    res.cookie(REFRESH_TOKEN, response.refreshToken, {
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    return res.json({
      message: 'Logged in successfully',
      success: true,
      data: response,
    });
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get()
  me(@Request() req) {
    return {
      message: 'User info',
      data: req.user,
      success: true,
    };
  }

  @UseGuards(AccessTokenAuthGuard)
  @Post('/logout')
  async logout(@Request() req, @Res() res: Response) {
    res.clearCookie(REFRESH_TOKEN);
    res.clearCookie(ACCESS_TOKEN);

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Logged out successfully' });
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh_token')
  async refreshToken(
    @Body('refresh_token') refreshToken: string,
    @Res() res: Response,
  ) {
    const response = await this.authService.refreshToken(refreshToken);
    // res.setHeader(ACCESS_TOKEN, response.data.access_token); uncomment this line if you are using headers to send the token
    res.cookie(REFRESH_TOKEN, response.refresh_token, {
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
      secure: true,
      sameSite: 'none',
    });
    res.cookie(ACCESS_TOKEN, response.access_token, {
      maxAge: ACESS_TOKEN_COOKIE_MAX_AGE,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    return res.json({
      message: 'token_refreshed',
      success: true,
      data: {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      },
    });
  }
}
