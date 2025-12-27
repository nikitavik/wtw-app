import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { Movie } from '../catalog/movie.entity';
import { EventType } from './event-type.enum';
import { EventSource } from './event-source.enum';

@Entity('user_events')
export class UserEvent {
  @ApiProperty({ description: 'Event ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({ description: 'Movie ID', example: 550 })
  @Column({ type: 'bigint' })
  item_id: number;

  @ApiProperty({
    description: 'Event type',
    enum: EventType,
    example: EventType.VIEW,
  })
  @Column({
    type: 'enum',
    enum: EventType,
  })
  event_type: EventType;

  @ApiProperty({
    description: 'Event value (nullable)',
    example: 5.5,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  event_value: number | null;

  @ApiProperty({
    description: 'Event source',
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
