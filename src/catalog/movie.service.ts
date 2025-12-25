import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import type {
  PaginationOptions,
  PaginationMeta,
  PaginatedMoviesResponse,
} from './movie.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
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
    options: PaginationOptions = {},
  ): Promise<PaginatedMoviesResponse> {
    const { page = 1, limit = 20 } = options;

    const offset = this.getOffsetFromPage(page, limit);

    // Get total count for pagination metadata
    const totalItems = await this.movieRepository.count();

    // Build query with pagination
    const query = this.movieRepository
      .createQueryBuilder('movie')
      .limit(limit)
      .offset(offset);

    const data = await query.getMany();

    const meta = this.createPaginationMeta(totalItems, limit, page);

    return { data, meta };
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
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
