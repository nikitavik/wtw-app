import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { WatchlistItem } from './watchlist-item.entity';
import { Movie } from '../catalog/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WatchlistItem, Movie])],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [TypeOrmModule, WatchlistService],
})
export class WatchlistModule {}
