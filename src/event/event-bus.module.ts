import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventBusService } from './event-bus.service';
import { ProfileModule } from '../profile/profile.module';
import { ProfileQueueModule } from '../queues/profile/profile-queue.module';

/**
 * Infrastructure Module: Event Bus
 * Depends on ProfileModule for UserEvent repository.
 * Depends on ProfileQueueModule to enqueue profile aggregation jobs.
 * No circular dependencies - both infrastructure modules depend on application layer.
 */
@Module({
  imports: [
    ProfileModule, // Provides UserEvent repository via TypeOrmModule export
    ProfileQueueModule, // Provides ProfileQueue service
  ],
  controllers: [EventController],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
