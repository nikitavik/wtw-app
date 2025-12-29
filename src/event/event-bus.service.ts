import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEvent } from './user-event.entity';
import { UserEventDto } from './user-event.dto';

@Injectable()
export class EventBusService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
  ) {}

  @OnEvent('userEvent.*', { async: true })
  async handleUserEvent(payload: UserEventDto): Promise<UserEvent> {
    const userEvent = this.userEventRepository.create(payload);
    console.log('handleUserEvent', userEvent);
    const savedEvent = await this.userEventRepository.save(userEvent);
    console.log('savedEvent', savedEvent);
    return savedEvent;
  }

  async getUserEvents(userId: string): Promise<UserEvent[]> {
    return this.userEventRepository.find({ where: { user_id: userId } });
  }
}
