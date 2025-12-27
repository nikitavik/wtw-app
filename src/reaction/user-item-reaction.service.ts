import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserItemReaction } from './user-item-reaction.entity';
import { ReactionType } from './reaction-type.enum';

@Injectable()
export class UserItemReactionService {
  constructor(
    @InjectRepository(UserItemReaction)
    private readonly reactionRepository: Repository<UserItemReaction>,
  ) {}

  async addLike(user_id: string, item_id: number): Promise<UserItemReaction> {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user_id, item_id },
    });

    if (existingReaction) {
      existingReaction.reaction = ReactionType.LIKE;
      return await this.reactionRepository.save(existingReaction);
    } else {
      const newReaction = this.reactionRepository.create({
        user_id,
        item_id,
        reaction: ReactionType.LIKE,
      });
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

    await this.reactionRepository.remove(existingReaction);
  }

  async addDislike(
    user_id: string,
    item_id: number,
  ): Promise<UserItemReaction> {
    const existingReaction = await this.reactionRepository.findOne({
      where: { user_id, item_id },
    });

    if (existingReaction) {
      existingReaction.reaction = ReactionType.DISLIKE;
      return await this.reactionRepository.save(existingReaction);
    } else {
      const newReaction = this.reactionRepository.create({
        user_id,
        item_id,
        reaction: ReactionType.DISLIKE,
      });
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

    await this.reactionRepository.remove(existingReaction);
  }

  async getUserReactions(user_id: string): Promise<UserItemReaction[]> {
    return this.reactionRepository.find({
      where: { user_id },
      order: { updated_at: 'DESC' },
    });
  }
}
