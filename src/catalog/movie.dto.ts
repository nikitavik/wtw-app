import { ApiProperty } from '@nestjs/swagger';
import { Movie } from './movie.entity';

export class PaginationOptions {
  @ApiProperty({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20,
  })
  limit?: number;
}

export class PaginationMeta {
  @ApiProperty({
    description: 'Total number of items',
    example: 1000,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Number of items in current page',
    example: 20,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  itemsPerPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 50,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;
}

export class PaginatedMoviesResponse {
  @ApiProperty({
    description: 'Array of movies',
    type: [Movie],
  })
  data: Movie[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
}

export class MovieCountResponse {
  @ApiProperty({
    description: 'Total number of movies',
    example: 1000,
  })
  count: number;
}
