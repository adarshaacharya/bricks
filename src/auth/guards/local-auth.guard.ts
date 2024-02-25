import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * this for login route only to check valid creds or not
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
