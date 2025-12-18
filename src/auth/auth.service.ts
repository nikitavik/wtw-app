import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserPayload, LoginResponse } from '../shared/lib/types';

import { UserService } from '../user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserPayload | null> {
    const user = await this.userService.findOne(email);
    if (user) {
      let isValidPassword = false;

      isValidPassword = await bcrypt.compare(pass, user.password);

      if (isValidPassword) {
        const { password: _, ...result } = user;
        return result;
      }
    }
    return null;
  }

  login(user: UserPayload): LoginResponse {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
