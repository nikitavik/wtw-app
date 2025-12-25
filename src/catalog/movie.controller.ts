import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MovieService } from './movie.service';

import type { PaginationOptions } from './movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('title') title?: string,
  ) {
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
  async count() {
    const count = await this.movieService.count();
    return { count };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(id);
  }
}
