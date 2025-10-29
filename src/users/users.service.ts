import { Injectable } from '@nestjs/common';

export type User = {
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
