import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(email: string, password: string): Promise<User> {
    const user = this.userRepository.create({ email, password });
    return this.userRepository.save(user);
  }
}
