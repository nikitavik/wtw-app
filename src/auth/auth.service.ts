import { Injectable } from '@nestjs/common';

import { UserService, User } from '../user';
import { JwtService } from '@nestjs/jwt';

type UserPayload = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserPayload | null> {
    const user = await this.userService.findOne(email);
    if (user && user.password === pass) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: UserPayload) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
