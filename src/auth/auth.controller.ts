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
import { SignupDto, SignupResponseDto } from './dtos/signup.dto';
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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';
import { AuthRequestType } from 'src/common/types/auth-reqest.types';
import { UserService } from 'src/user/user.service';
import { ForgottenPasswordEmailDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/recovery-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GoogleOauthGuard } from './guards/google-oath.guard';
import { ENV } from 'src/common/config/configuration';
import { User } from '@prisma/client';
import { GithubOauthGuard } from './guards/github-oath.guard';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { plainToClass } from 'class-transformer';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Sign Up User' })
  @ApiBody({ type: SignupDto, description: 'User Data' })
  @Serialize(SignupResponseDto)
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @ApiOperation({ summary: 'Sign in' })
  @ApiBody({ type: LoginDto, description: 'User Data' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: LoginResponseDto,
  })
  async login(
    @Request() req,
    @Body() _loginDto: LoginDto,
    @Res() res: Response,
  ) {
    const response = await this.authService.login(req.user as User);

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

    // since we have to do res.send so can't use Serialize decorator
    const mappedResponse = plainToClass(LoginResponseDto, response, {
      excludeExtraneousValues: true,
    });

    res.status(HttpStatus.OK).send(mappedResponse);
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'User Info' })
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
  @ApiParam({ name: 'code', description: 'Verification Code' })
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
  @ApiParam({ name: 'userId', description: 'User Id' })
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
    const response = await this.authService.login(req.user as User);

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

  @ApiOperation({
    summary: 'Github Login Redirect',
    description: 'Redirect to github login page i.e. first step',
  })
  @Get('github')
  @UseGuards(GithubOauthGuard)
  async githubAuth(@Res() res: Response) {
    res.send();
  }

  // this will take req user and generate jwt token and redirect to frontend
  @ApiOperation({
    summary: 'Github Login Callback',
    description: 'Callback URL for github login',
  })
  @Get('github/callback')
  @UseGuards(GithubOauthGuard)
  async githubAuthCallback(@Request() req, @Res() res: Response) {
    const response = await this.authService.login(req.user as User);

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
