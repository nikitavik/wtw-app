import { Injectable, ConflictException } from '@nestjs/common';
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
    try {
      const user = this.userRepository.create({ email, password });
      return await this.userRepository.save(user);
    } catch (error) {
      // Handle database constraint violations
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('User with this email already exists');
      }
      throw error; // Re-throw other errors
    }
  }
}
