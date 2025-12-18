import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { User } from './user';

import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

import { AppService } from './app.service';
import { Public } from './auth/jwt-auth.guard';

type UserPayload = Omit<User, 'password'>;

interface RequestWithUser extends Request {
  user: UserPayload;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Post('auth/logout')
  logout(@Request() req: RequestWithUser) {
    return { message: 'Logged out successfully', user: req.user };
  }
}
