import { User } from '../../../user/user.entity';

export type UserPayload = Omit<User, 'password'>;

export type LoginResponse = {
  access_token: string;
};
