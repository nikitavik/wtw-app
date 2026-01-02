import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 4,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout message',
    example: 'Logged out successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
    },
  })
  user: {
    id: string;
    email: string;
  };
}

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}

export class ProfileAggregationResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  user_id: string;

  @ApiProperty({ description: 'Profile version', example: 1 })
  profile_version: number;

  @ApiProperty({ description: 'Aggregation window in days', example: 90 })
  window_days: number;

  @ApiProperty({
    description: 'When profile was computed',
    example: '2024-01-01T00:00:00.000Z',
  })
  computed_at: Date;

  @ApiProperty({
    description: 'Genre preference weights',
    example: { Drama: 3.2, Thriller: 2.1 },
  })
  genre_weights: Record<string, number>;

  @ApiProperty({
    description: 'Decade preference weights',
    example: { '1990s': 2.5, '2000s': 1.8 },
  })
  decade_weights: Record<string, number>;

  @ApiProperty({
    description: 'Language preference weights',
    example: { English: 3.0, Spanish: 1.2 },
  })
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
  stats: Record<string, unknown>;

  @ApiProperty({ description: 'Total number of recorded events', example: 42 })
  total_events: number;

  @ApiProperty({ description: 'Total likes', example: 10 })
  like_count: number;

  @ApiProperty({ description: 'Total dislikes', example: 2 })
  dislike_count: number;

  @ApiProperty({
    description: 'IDs of liked items',
    example: [1, 2, 3],
    isArray: true,
    type: Number,
  })
  liked_items: number[];

  @ApiProperty({
    description: 'IDs of disliked items',
    example: [4, 5],
    isArray: true,
    type: Number,
  })
  disliked_items: number[];

  @ApiProperty({
    description: 'Timestamp of the most recent event',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  last_event_at: Date | null;

  @ApiProperty({
    description: 'Profile creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Profile last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}
