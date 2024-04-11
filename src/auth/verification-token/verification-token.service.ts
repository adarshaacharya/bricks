import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

type VerificationToken = {
  email: string;
  code: string;
};

@Injectable()
export class VerificationTokenService {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(VerificationTokenService.name);
  }

  async createVerificationToken(email: string, code: string) {
    try {
      const payload: VerificationToken = {
        email: email,
        code,
      };

      // encode to base64
      const token = btoa(JSON.stringify(payload));

      this.logger.info(`Verification code created: ${token} for user ${email}`);

      return token;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async decodeVerificationToken(token: string) {
    try {
      const decodedToken = atob(token);

      const payload = JSON.parse(decodedToken);

      this.logger.info(`Verification token decoded: ${decodedToken}`);

      return payload as VerificationToken;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
