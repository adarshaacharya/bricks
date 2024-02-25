import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PassHasherService } from 'src/pass-hasher/pass-hasher.service';
import { SignupDto } from './dtos/signup';
import { User } from '@prisma/client';
import { JWTPayload } from './interfaces/jwt.interface';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly passwordHasher: PassHasherService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      const { email, name, password, role } = signupDto;

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
          name,
          password: hashedPassword,
          role,
        },
      });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create user' + error,
      };
    }
  }

  async login(user: User) {
    const payload: Partial<JWTPayload> = {
      email: user.email,
      id: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getAuthenticatedUser(email: string, password: string) {
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
      console.log(error);
      return null;
    }
  }
}
