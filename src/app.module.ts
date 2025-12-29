import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserHttpModule } from './user-http';

import { CoreModule } from './core/core.module';
import { MovieModule } from './catalog/movie.module';
import { EventBusModule } from './event/event-bus.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { UserItemReactionModule } from './reaction/user-item-reaction.module';

@Module({
  imports: [
    CoreModule,
    EventBusModule,
    UserHttpModule,
    MovieModule,
    WatchlistModule,
    UserItemReactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
