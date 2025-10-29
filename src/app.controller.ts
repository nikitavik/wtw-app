import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

import { AppService } from './app.service';
import { Public } from './auth/jwt-auth.guard';

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

  @Get('profile')
  getProfile(@Request() req: Request) {
    return 'req.user';
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: Request) {
    return await this.authService.login('req.user');
  }

  @Get('auth/logout')
  logout(@Request() req: Request) {
    return 'req.user';
  }
}
