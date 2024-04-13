import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Response } from 'express';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACESS_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from './consts';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { AuthRequestType } from 'src/common/types/AuthRequestType';
import { UserService } from 'src/user/user.service';
import { ForgottenPasswordEmailDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/recovery-password.dto';
import { ChangePasswordDto } from './dtos/change-passowrd.dto';
import { GoogleOauthGuard } from './guards/google-oath.guard';
import { ENV } from 'src/common/config/configuration';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Sign Up User' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Email already register' })
  @ApiBody({ type: SignupDto, description: 'User Data' })
  @ApiConsumes('multipart/form-data')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @ApiOperation({ summary: 'Sign in' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiResponse({ status: 200, description: 'Successful login' })
  @ApiResponse({ status: 403, description: 'Forbidden - User not logged' })
  @ApiBody({ type: LoginDto, description: 'User Data' })
  @ApiConsumes('multipart/form-data', 'application/json')
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

    return response;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'User Info' })
  @ApiResponse({ status: 200, description: 'User info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Request() req: AuthRequestType) {
    const user = await this.userService.getUserById(req.user.id);
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Successful logout' })
  async logout(@Request() req, @Res() res: Response) {
    res.clearCookie(REFRESH_TOKEN);
    res.clearCookie(ACCESS_TOKEN);

    return res.status(HttpStatus.OK);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh_token')
  @ApiOperation({ summary: 'Refresh Token' })
  @ApiSecurity('refresh_token')
  @ApiResponse({ status: 200, description: 'Token refreshed', type: String })
  @ApiResponse({ status: 401, description: 'Unauthorized from refresh' })
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

    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    };
  }

  // note : there is difference between token and code, token = whole base64 encoded string, code = only the code inside decoded token
  @Get('/signup/verify/:code')
  @ApiOperation({ summary: 'Verify Email' })
  async activateAccountAfterSignup(@Param('code') code: string) {
    return this.authService.activateAccountAfterSignup(code);
  }

  @Post('/forgot-password')
  @ApiOperation({ summary: 'Forgot Password' })
  async forgotPassword(
    @Body()
    forgotPassowrdDto: ForgottenPasswordEmailDto,
  ) {
    return this.authService.forgotPassword(forgotPassowrdDto);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  async resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.updateForgottenPassword(resetPasswordDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change Password' })
  async changePassword(
    @Body()
    resetPasswordDto: ChangePasswordDto,
    @Request() req: AuthRequestType,
  ) {
    return this.authService.changePassword(resetPasswordDto, req.user.id);
  }

  @Post('/:userId/resend-verification')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Resend Verification Email' })
  async resendVerificationEmail(@Param('userId') userId: string) {
    return this.authService.resendVerificationEmail(userId);
  }

  @ApiOperation({
    summary: 'Google Login Redirect',
    description: 'Redirect to google login page i.e. first step',
  })
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Res() res: Response) {
    res.send();
  }

  // this will take req user and generate jwt token and redirect to frontend
  @ApiOperation({
    summary: 'Google Login Callback',
    description: 'Callback URL for google login',
  })
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Request() req, @Res() res: Response) {
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

    return res.redirect(ENV.CLIENT_AUTH_REDIRECT_URL);
  }
}
