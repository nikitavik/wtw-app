import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserHttpModule } from './user-http';

import { CoreModule } from './core/core.module';
import { MovieModule } from './catalog/movie.module';
import { EventBusModule } from './event/event-bus.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { UserItemReactionModule } from './reaction/user-item-reaction.module';
import { QueuesModule } from './queues/queues.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [
    CoreModule,
    EventBusModule,
    QueuesModule,
    UserHttpModule,
    MovieModule,
    WatchlistModule,
    UserItemReactionModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
