import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEvent } from './user-event.entity';
import { UserEventDto } from './user-event.dto';
import { EventType } from './event-type.enum';
import { ProfileQueue } from '../queues/profile';

@Injectable()
export class EventBusService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
    private readonly profileQueue: ProfileQueue,
  ) {}

  @OnEvent('userEvent.*', { async: true })
  async handleUserEvent(payload: UserEventDto): Promise<UserEvent> {
    const userEvent = this.userEventRepository.create(payload);
    const savedEvent = await this.userEventRepository.save(userEvent);

    // Trigger profile aggregation for reaction events
    if (
      payload.event_type === EventType.LIKE ||
      payload.event_type === EventType.REMOVE_LIKE ||
      payload.event_type === EventType.DISLIKE ||
      payload.event_type === EventType.REMOVE_DISLIKE
    ) {
      await this.profileQueue.enqueueProfileAggregation(payload.user_id);
    }

    return savedEvent;
  }

  async getUserEvents(userId: string): Promise<UserEvent[]> {
    return this.userEventRepository.find({ where: { user_id: userId } });
  }
}
