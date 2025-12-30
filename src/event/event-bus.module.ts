import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventBusService } from './event-bus.service';
import { UserEvent } from './user-event.entity';
import { ProfileQueueModule } from '../queues/profile';

@Module({
  imports: [TypeOrmModule.forFeature([UserEvent]), ProfileQueueModule],
  controllers: [EventController],
  providers: [EventBusService],
  exports: [TypeOrmModule, EventBusService],
})
export class EventBusModule {}
