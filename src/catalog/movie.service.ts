import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { Movie } from './movie.entity';
import type {
  PaginationOptions,
  PaginationMeta,
  PaginatedMoviesResponse,
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
      .limit(limit)
      .offset(offset);

    const data = await query.getMany();

    const meta = this.createPaginationMeta(totalItems, limit, page);

    return { data, meta };
  }

  async findOne(userId: string, id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
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
    return movie;
  }

  async findByTitle(
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

    // Build paginated query
    const query = this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .limit(limit)
      .offset(offset);

    const data = await query.getMany();

    const meta = this.createPaginationMeta(totalItems, limit, page);

    return { data, meta };
  }

  async count(): Promise<number> {
    return this.movieRepository.count();
  }
}
