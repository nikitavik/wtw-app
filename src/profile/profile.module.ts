import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserProfile } from './user-profile.entity';
import { ProfileAggregationService } from './profile-aggregation.service';
import { UserEvent } from '../event/user-event.entity';
import { UserItemReaction } from '../reaction/user-item-reaction.entity';
import { WatchlistItem } from '../watchlist/watchlist-item.entity';
import { Movie } from '../catalog/movie.entity';

/**
 * Profile Domain Module
 * Contains application services and registers all required repositories.
 * Infrastructure modules (queues, events) depend on this module.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      UserEvent,
      UserItemReaction,
      WatchlistItem,
      Movie,
    ]),
  ],
  providers: [ProfileAggregationService],
  exports: [ProfileAggregationService, TypeOrmModule],
})
export class ProfileModule {}
