import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import type { RegisterUserDto } from './user-http.dto';
import { Public } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import type { UserPayload } from '../shared/lib/types';
import { AuthService } from 'src/auth/auth.service';

interface RequestWithUser extends Request {
  user: UserPayload;
}

@Controller('user')
export class UserHttpController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  logout(@Request() req: RequestWithUser) {
    return { message: 'Logged out successfully', user: req.user };
  }

  @Public()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { email, password } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userService.findOne(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create(email, password);
    return { id: user.id, email: user.email };
  }

  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
