import { Controller, Get, Request } from '@nestjs/common';
import { User } from '../user/user.entity';

type UserPayload = Omit<User, 'password'>;

interface RequestWithUser extends Request {
  user: UserPayload;
}

@Controller('user')
export class UserHttpController {
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
