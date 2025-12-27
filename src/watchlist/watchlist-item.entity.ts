import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { Movie } from '../catalog/movie.entity';
import { EventSource } from '../event/event-source.enum';

@Entity('watchlist_items')
@Unique(['user_id', 'item_id'])
export class WatchlistItem {
  @ApiProperty({ description: 'Watchlist item ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({ description: 'Movie ID', example: 550 })
  @Column({ type: 'bigint' })
  item_id: number;

  @ApiProperty({
    description: 'Source',
    enum: EventSource,
    example: EventSource.CATALOG,
  })
  @Column({
    type: 'enum',
    enum: EventSource,
  })
  source: EventSource;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'item_id' })
  movie: Movie;
}
