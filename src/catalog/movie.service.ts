import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { Movie } from './movie.entity';
import type {
  PaginationOptions,
  PaginationMeta,
  PaginatedMoviesResponse,
  MovieResponse,
} from './movie.dto';
import { EventType } from 'src/event/event-type.enum';
import { UserEventDto } from 'src/event/user-event.dto';
import { EventSource } from 'src/event';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private createPaginationMeta(
    totalItems: number,
    limit: number,
    currentPage: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      totalItems,
      itemCount: limit,
      itemsPerPage: limit,
      totalPages,
      currentPage,
      hasNextPage,
      hasPreviousPage,
    };
  }

  private getOffsetFromPage(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  private transformMovie(movie: Movie): MovieResponse {
    const { watchlistItems, reactions, ...movieData } = movie;
    const reaction =
      reactions && reactions.length > 0 ? reactions[0].reaction : null;
    const isInWatchlist = Boolean(watchlistItems && watchlistItems.length > 0);

    return {
      ...movieData,
      isInWatchlist,
      reaction,
    };
  }

  async findAll(
    userId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedMoviesResponse> {
    const { page = 1, limit = 20 } = options;

    const offset = this.getOffsetFromPage(page, limit);

    // Get total count for pagination metadata
    const totalItems = await this.movieRepository.count();

    // Build query with pagination
    const query = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect(
        'movie.reactions',
        'reactions',
        'reactions.user_id = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'movie.watchlistItems',
        'watchlistItems',
        'watchlistItems.user_id = :userId',
        { userId },
      )
      .limit(limit)
      .offset(offset);

    const movies = await query.getMany();

    // Transform movies to add isInWatchlist flag and remove watchlistItems
    const data: MovieResponse[] = movies.map((movie) =>
      this.transformMovie(movie),
    );

    const meta = this.createPaginationMeta(totalItems, limit, page);

    return { data, meta } as PaginatedMoviesResponse;
  }

  async findOne(userId: string, id: number): Promise<MovieResponse> {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect(
        'movie.reactions',
        'reactions',
        'reactions.user_id = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'movie.watchlistItems',
        'watchlistItems',
        'watchlistItems.user_id = :userId',
        { userId },
      )
      .where('movie.id = :id', { id })
      .getOne();

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    const userEvent: UserEventDto = {
      user_id: userId,
      item_id: id,
      event_type: EventType.VIEW,
      event_value: null,
      source: EventSource.CATALOG,
    };

    this.eventEmitter.emit('userEvent.view', userEvent);
    return this.transformMovie(movie);
  }

  async findByTitle(
    userId: string,
    title: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedMoviesResponse> {
    const { page = 1, limit = 20 } = options;
    const offset = this.getOffsetFromPage(page, limit);

    // Get total count for pagination metadata
    const totalItems = await this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .getCount();

    // Build paginated query with watchlist check
    const query = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect(
        'movie.reactions',
        'reactions',
        'reactions.user_id = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'movie.watchlistItems',
        'watchlistItems',
        'watchlistItems.user_id = :userId',
        { userId },
      )
      .where('LOWER(movie.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .limit(limit)
      .offset(offset);

    const movies = await query.getMany();

    // Transform movies to add isInWatchlist flag and remove watchlistItems
    const data: MovieResponse[] = movies.map((movie) =>
      this.transformMovie(movie),
    );

    const meta = this.createPaginationMeta(totalItems, limit, page);

    return { data, meta } as PaginatedMoviesResponse;
  }

  async count(): Promise<number> {
    return this.movieRepository.count();
  }
}
