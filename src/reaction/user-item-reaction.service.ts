import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { UserItemReaction } from './user-item-reaction.entity';
import { ReactionType } from './reaction-type.enum';
import { UserEventDto, EventType, EventSource } from '../event';

@Injectable()
export class UserItemReactionService {
  constructor(
    @InjectRepository(UserItemReaction)
    private readonly reactionRepository: Repository<UserItemReaction>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addLike(
    user_id: string,
    item_id: number,
    source: EventSource = EventSource.CATALOG,
  ): Promise<UserItemReaction> {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user_id, item_id },
    });

    const userEvent: UserEventDto = {
      user_id,
      item_id,
      event_type: EventType.LIKE,
      event_value: null,
      source,
    };

    if (existingReaction) {
      existingReaction.reaction = ReactionType.LIKE;
      existingReaction.source = source;
      const savedReaction =
        await this.reactionRepository.save(existingReaction);
      this.eventEmitter.emit('userEvent.like', userEvent);
      return savedReaction;
    } else {
      const newReaction = this.reactionRepository.create({
        user_id,
        item_id,
        reaction: ReactionType.LIKE,
        source,
      });

      this.eventEmitter.emit('userEvent.like', userEvent);
      return await this.reactionRepository.save(newReaction);
    }
  }

  async removeLike(user_id: string, item_id: number): Promise<void> {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user_id, item_id },
    });

    if (!existingReaction) {
      throw new NotFoundException('Like not found');
    }

    if (existingReaction.reaction !== ReactionType.LIKE) {
      throw new ConflictException('Reaction is not a like');
    }

    const userEvent: UserEventDto = {
      user_id,
      item_id,
      event_type: EventType.REMOVE_LIKE,
      event_value: null,
      source: existingReaction.source,
    };

    this.eventEmitter.emit('userEvent.remove_like', userEvent);

    await this.reactionRepository.remove(existingReaction);
  }

  async addDislike(
    user_id: string,
    item_id: number,
    source: EventSource = EventSource.CATALOG,
  ): Promise<UserItemReaction> {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user_id, item_id },
    });

    const userEvent: UserEventDto = {
      user_id,
      item_id,
      event_type: EventType.DISLIKE,
      event_value: null,
      source,
    };

    if (existingReaction) {
      existingReaction.reaction = ReactionType.DISLIKE;
      existingReaction.source = source;
      const savedReaction =
        await this.reactionRepository.save(existingReaction);
      this.eventEmitter.emit('userEvent.dislike', userEvent);
      return savedReaction;
    } else {
      const newReaction = this.reactionRepository.create({
        user_id,
        item_id,
        reaction: ReactionType.DISLIKE,
        source,
      });

      this.eventEmitter.emit('userEvent.dislike', userEvent);
      return await this.reactionRepository.save(newReaction);
    }
  }

  async removeDislike(user_id: string, item_id: number): Promise<void> {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user_id, item_id },
    });

    if (!existingReaction) {
      throw new NotFoundException('Dislike not found');
    }

    if (existingReaction.reaction !== ReactionType.DISLIKE) {
      throw new ConflictException('Reaction is not a dislike');
    }

    const userEvent: UserEventDto = {
      user_id,
      item_id,
      event_type: EventType.REMOVE_DISLIKE,
      event_value: null,
      source: existingReaction.source,
    };

    this.eventEmitter.emit('userEvent.remove_dislike', userEvent);

    await this.reactionRepository.remove(existingReaction);
  }

  async getUserReactions(user_id: string): Promise<UserItemReaction[]> {
    return this.reactionRepository.find({
      where: { user_id },
      order: { updated_at: 'DESC' },
    });
  }
}
