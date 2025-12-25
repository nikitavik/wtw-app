import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConstants } from './constant';
import { UserService } from '../user/user.service';
import type { UserPayload } from '../shared/lib/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // https://github.com/mikenicholson/passport-jwt#configure-strategy
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants(configService).secret,
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
  }): Promise<UserPayload | null> {
    const userId = payload?.sub;

    if (!userId || typeof userId !== 'string') {
      return null;
    }

    // Fetch user from database to ensure we have the latest data
    const user = await this.userService.findById(userId);

    if (!user) {
      return null;
    }

    // Return user payload without password
    const { password: _, ...userPayload } = user;
    return userPayload;
  }
}
