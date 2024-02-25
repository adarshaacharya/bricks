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
import JwtAuthGuard from './guards/jwt-auth.guard';
import { Response } from 'express';
import { AUTH_TOKEN, expirationTime } from './consts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Request() req, @Res() res: Response) {
    const response = await this.authService.login(req.user);

    res.setHeader(AUTH_TOKEN, response.access_token);

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  me(@Request() req) {
    return req.user;
  }
}
