import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { EventSource } from '../event/event-source.enum';

export class AddWatchlistItemDto {
  @ApiProperty({
    description: 'Movie ID',
    example: 550,
  })
  @Type(() => Number)
  @IsInt()
  item_id: number;

  @ApiProperty({
    description: 'Source',
    enum: EventSource,
    example: EventSource.CATALOG,
  })
  @IsEnum(EventSource)
  source: EventSource;
}

export class RemoveWatchlistItemDto {
  @ApiProperty({
    description: 'Movie ID',
    example: 550,
  })
  @Type(() => Number)
  @IsInt()
  item_id: number;
}

export class WatchlistItemResponseDto {
  @ApiProperty({ description: 'Watchlist item ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  user_id: string;

  @ApiProperty({ description: 'Movie ID', example: 550 })
  item_id: number;

  @ApiProperty({
    description: 'Source',
    enum: EventSource,
    example: EventSource.CATALOG,
  })
  source: EventSource;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;
}
