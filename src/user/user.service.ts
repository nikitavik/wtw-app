import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
      });
      return await this.userRepository.save(user);
    } catch (error) {
      // Handle database constraint violations
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError?.code === '23505') {
          // PostgreSQL unique constraint violation
          throw new ConflictException('User with this email already exists');
        }
      }
      throw error; // Re-throw other errors
    }
  }
}
