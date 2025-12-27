import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../user/user.entity';
import { Movie } from '../catalog/movie.entity';
import { ReactionType } from './reaction-type.enum';

@Entity('user_item_reactions')
@Unique(['user_id', 'item_id'])
export class UserItemReaction {
  @ApiProperty({ description: 'Reaction ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({ description: 'Movie ID', example: 550 })
  @Column({ type: 'bigint' })
  item_id: number;

  @ApiProperty({
    description: 'Reaction type',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @Column({
    type: 'enum',
    enum: ReactionType,
    default: ReactionType.LIKE,
  })
  reaction: ReactionType;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'item_id' })
  movie: Movie;
}
