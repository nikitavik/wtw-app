import { User } from '../../../user/user.entity';

export type UserPayload = Omit<User, 'password'> & {
  access_token: string;
};

