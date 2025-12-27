import type { Request } from 'express';
import { User } from '../../../user/user.entity';

export type UserPayload = Omit<User, 'password'>;

export type LoginResponse = {
  access_token: string;
};

export type RequestWithUser = Request & {
  user: UserPayload;
};
