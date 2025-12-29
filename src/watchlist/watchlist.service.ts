import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { WatchlistItem } from './watchlist-item.entity';
import { EventSource } from '../event/event-source.enum';
import { UserEventDto, EventType } from '../event';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
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

  async getWatchlist(user_id: string): Promise<WatchlistItem[]> {
    return this.watchlistRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }
}
