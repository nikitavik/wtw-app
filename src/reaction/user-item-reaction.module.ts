import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserItemReactionController } from './user-item-reaction.controller';
import { UserItemReactionService } from './user-item-reaction.service';
import { UserItemReaction } from './user-item-reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserItemReaction])],
  controllers: [UserItemReactionController],
  providers: [UserItemReactionService],
  exports: [TypeOrmModule, UserItemReactionService],
})
export class UserItemReactionModule {}
