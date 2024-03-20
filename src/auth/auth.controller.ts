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
import { LoginDto } from './dtos/login';
import { AuthRequestType } from 'src/common/types/AuthRequestType';
import { UserService } from 'src/user/user.service';

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

    return res.json({
      message: 'Logged in successfully',
      success: true,
      data: response,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'User Info' })
  @ApiResponse({ status: 200, description: 'User info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Request() req: AuthRequestType) {
    const user = await this.userService.getUserById(req.user.id);
    return {
      message: 'User info',
      data: user,
      success: true,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Successful logout' })
  async logout(@Request() req, @Res() res: Response) {
    res.clearCookie(REFRESH_TOKEN);
    res.clearCookie(ACCESS_TOKEN);

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Logged out successfully' });
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
