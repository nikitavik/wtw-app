import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import {
  RegisterUserDto,
  LoginUserDto,
  LoginResponseDto,
  RegisterResponseDto,
  LogoutResponseDto,
  UserProfileDto,
} from './user-http.dto';
import { Public } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import type { UserPayload } from '../shared/lib/types';
import { AuthService } from 'src/auth/auth.service';

interface RequestWithUser extends Request {
  user: UserPayload;
}

@ApiTags('user')
@Controller('user')
export class UserHttpController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user and return JWT token',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Request() req: RequestWithUser): LoginResponseDto {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logout the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  logout(@Request() req: RequestWithUser): LogoutResponseDto {
    return { message: 'Logged out successfully', user: req.user };
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@Request() req: RequestWithUser): UserProfileDto {
    // JWT strategy already fetches user from database, so req.user has the latest data
    return {
      id: req.user.id,
      email: req.user.email,
    };
  }
}
