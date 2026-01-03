import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Movie } from '../catalog/movie.entity';
import { UserProfile } from '../profile/user-profile.entity';
import { WatchlistItem } from '../watchlist/watchlist-item.entity';
import { UserItemReaction } from '../reaction/user-item-reaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      UserProfile,
      WatchlistItem,
      UserItemReaction,
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
