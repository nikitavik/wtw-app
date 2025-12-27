import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchlistItem } from './watchlist-item.entity';
import { EventSource } from '../event/event-source.enum';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
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

    return await this.watchlistRepository.save(watchlistItem);
  }

  async removeItem(user_id: string, item_id: number): Promise<void> {
    const result = await this.watchlistRepository.delete({
      user_id,
      item_id,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Item not found in watchlist');
    }
  }

  async getWatchlist(user_id: string): Promise<WatchlistItem[]> {
    return this.watchlistRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }
}
