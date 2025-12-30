import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { WatchlistItem } from './watchlist-item.entity';
import { Movie } from '../catalog/movie.entity';
import { EventSource } from '../event/event-source.enum';
import { UserEventDto, EventType } from '../event';
import type { MovieResponse } from '../catalog/movie.dto';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addItem(
    user_id: string,
    item_id: number,
    source: EventSource,
  ): Promise<WatchlistItem> {
    // Check if item already exists
    const existingItem = await this.watchlistRepository.findOne({
      where: { user_id, item_id },
    });

    if (existingItem) {
      throw new ConflictException('Item already exists in watchlist');
    }

    const watchlistItem = this.watchlistRepository.create({
      user_id,
      item_id,
      source,
    });

    const userEvent: UserEventDto = {
      user_id,
      item_id,
      event_type: EventType.ADD_TO_WATCHLIST,
      event_value: null,
      source,
    };

    this.eventEmitter.emit('userEvent.add_to_watchlist', userEvent);

    return await this.watchlistRepository.save(watchlistItem);
  }

  async removeItem(user_id: string, item_id: number): Promise<void> {
    const existingItem = await this.watchlistRepository.findOne({
      where: { user_id, item_id },
    });

    if (!existingItem) {
      throw new NotFoundException('Item not found in watchlist');
    }

    const userEvent: UserEventDto = {
      user_id,
      item_id,
      event_type: EventType.REMOVE_FROM_WATCHLIST,
      event_value: null,
      source: existingItem.source,
    };

    this.eventEmitter.emit('userEvent.remove_from_watchlist', userEvent);

    await this.watchlistRepository.remove(existingItem);
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

  async getWatchlist(user_id: string): Promise<MovieResponse[]> {
    const watchlistItems = await this.watchlistRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });

    if (watchlistItems.length === 0) {
      return [];
    }

    const itemIds = watchlistItems.map((item) => item.item_id);

    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect(
        'movie.reactions',
        'reactions',
        'reactions.user_id = :userId',
        { userId: user_id },
      )
      .leftJoinAndSelect(
        'movie.watchlistItems',
        'watchlistItems',
        'watchlistItems.user_id = :userId',
        { userId: user_id },
      )
      .where('movie.id IN (:...itemIds)', { itemIds })
      .getMany();

    // Sort movies to match watchlist order (most recent first)
    const movieMap = new Map(movies.map((movie) => [movie.id, movie]));
    const sortedMovies = watchlistItems
      .map((item) => movieMap.get(item.item_id))
      .filter((movie): movie is Movie => movie !== undefined);

    return sortedMovies.map((movie) => this.transformMovie(movie));
  }
}
