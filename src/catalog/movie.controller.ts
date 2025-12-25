import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MovieService } from './movie.service';
import {
  PaginationOptions,
  PaginatedMoviesResponse,
  MovieCountResponse,
} from './movie.dto';
import { Movie } from './movie.entity';

@ApiTags('movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all movies',
    description:
      'Retrieve a paginated list of movies. Optionally filter by title.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-indexed)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Filter movies by title (case-insensitive partial match)',
    example: 'fight',
  })
  @ApiResponse({
    status: 200,
    description: 'List of movies retrieved successfully',
    type: PaginatedMoviesResponse,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('title') title?: string,
  ): Promise<PaginatedMoviesResponse> {
    const paginationOptions: PaginationOptions = {
      page,
      limit,
    };

    if (title) {
      return this.movieService.findByTitle(title, paginationOptions);
    }

    return this.movieService.findAll(paginationOptions);
  }

  @Get('count')
  @ApiOperation({
    summary: 'Get total movie count',
    description: 'Get the total number of movies in the database',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie count retrieved successfully',
    type: MovieCountResponse,
  })
  async count(): Promise<MovieCountResponse> {
    const count = await this.movieService.count();
    return { count };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get movie by ID',
    description: 'Retrieve a single movie by its ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Movie ID',
    example: 550,
  })
  @ApiResponse({
    status: 200,
    description: 'Movie retrieved successfully',
    type: Movie,
  })
  @ApiNotFoundResponse({ description: 'Movie not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.movieService.findOne(id);
  }
}
