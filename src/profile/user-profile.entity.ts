import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_profiles')
export class UserProfile {
  @ApiProperty({ description: 'User ID (profile_id)', example: 'uuid-string' })
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @ApiProperty({
    description: 'Profile version for schema evolution',
    example: 1,
  })
  @Column({ type: 'integer', default: 1 })
  profile_version: number;

  @ApiProperty({
    description: 'Aggregation window in days',
    example: 90,
  })
  @Column({ type: 'integer', default: 90 })
  window_days: number;

  @ApiProperty({
    description: 'When profile was computed',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamptz', default: () => 'now()' })
  computed_at: Date;

  @ApiProperty({
    description: 'Genre preference weights',
    example: { Drama: 3.2, Thriller: 2.1 },
  })
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  genre_weights: Record<string, number>;

  @ApiProperty({
    description: 'Decade preference weights',
    example: { '1990s': 2.5, '2000s': 1.8 },
  })
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  decade_weights: Record<string, number>;

  @ApiProperty({
    description: 'Language preference weights',
    example: { English: 3.0, Spanish: 1.2 },
  })
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  language_weights: Record<string, number>;

  @ApiProperty({
    description: 'Profile statistics and metrics',
    example: {
      events_total_90d: 42,
      last_event_at: '2024-01-01T00:00:00.000Z',
      active_days_90d: 15,
      views_count_90d: 30,
      likes_count_90d: 10,
      unlikes_count_90d: 2,
      watchlist_add_count_90d: 5,
      watchlist_remove_count_90d: 1,
      liked_items_count: 8,
      watchlist_items_count: 4,
      preference_confidence: 0.75,
      taste_diversity: 0.65,
    },
  })
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  stats: Record<string, unknown>;

  // Legacy fields (keep for backward compatibility)
  @ApiProperty({ description: 'Total number of recorded events', example: 42 })
  @Column({ type: 'integer', default: 0 })
  total_events: number;

  @ApiProperty({ description: 'Total likes', example: 10 })
  @Column({ type: 'integer', default: 0 })
  like_count: number;

  @ApiProperty({ description: 'Total dislikes', example: 2 })
  @Column({ type: 'integer', default: 0 })
  dislike_count: number;

  @ApiProperty({
    description: 'IDs of liked items',
    example: [1, 2, 3],
    isArray: true,
    type: Number,
  })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  liked_items: number[];

  @ApiProperty({
    description: 'IDs of disliked items',
    example: [4, 5],
    isArray: true,
    type: Number,
  })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  disliked_items: number[];

  @ApiProperty({
    description: 'Timestamp of the most recent event',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamptz', nullable: true })
  last_event_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
