import {
  Controller,
  Post,
  Get,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserItemReactionService } from './user-item-reaction.service';
import { UserItemReactionResponseDto } from './user-item-reaction.dto';
import type { UserPayload } from '../shared/lib/types';

interface RequestWithUser extends Request {
  user: UserPayload;
}

@ApiTags('reactions')
@Controller('reactions')
export class UserItemReactionController {
  constructor(private readonly reactionService: UserItemReactionService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all user reactions',
    description: 'Get all reactions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Reactions retrieved successfully',
    type: [UserItemReactionResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUserReactions(
    @Request() req: RequestWithUser,
  ): Promise<UserItemReactionResponseDto[]> {
    const reactions = await this.reactionService.getUserReactions(req.user.id);

    return reactions.map((reaction) => ({
      id: reaction.id,
      user_id: reaction.user_id,
      item_id: reaction.item_id,
      reaction: reaction.reaction,
      updated_at: reaction.updated_at,
    }));
  }

  @Post(':item_id/like')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add like',
    description: 'Add a like reaction for a movie',
  })
  @ApiParam({
    name: 'item_id',
    type: Number,
    description: 'Movie ID',
    example: 550,
  })
  @ApiResponse({
    status: 200,
    description: 'Like added successfully',
    type: UserItemReactionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async addLike(
    @Request() req: RequestWithUser,
    @Param('item_id', ParseIntPipe) item_id: number,
  ): Promise<UserItemReactionResponseDto> {
    const reaction = await this.reactionService.addLike(req.user.id, item_id);

    return {
      id: reaction.id,
      user_id: reaction.user_id,
      item_id: reaction.item_id,
      reaction: reaction.reaction,
      updated_at: reaction.updated_at,
    };
  }

  @Delete(':item_id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove like',
    description: 'Remove a like reaction for a movie',
  })
  @ApiParam({
    name: 'item_id',
    type: Number,
    description: 'Movie ID',
    example: 550,
  })
  @ApiResponse({
    status: 204,
    description: 'Like removed successfully',
  })
  @ApiNotFoundResponse({ description: 'Like not found' })
  @ApiConflictResponse({ description: 'Reaction is not a like' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async removeLike(
    @Request() req: RequestWithUser,
    @Param('item_id', ParseIntPipe) item_id: number,
  ): Promise<void> {
    await this.reactionService.removeLike(req.user.id, item_id);
  }

  @Post(':item_id/dislike')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add dislike',
    description: 'Add a dislike reaction for a movie',
  })
  @ApiParam({
    name: 'item_id',
    type: Number,
    description: 'Movie ID',
    example: 550,
  })
  @ApiResponse({
    status: 200,
    description: 'Dislike added successfully',
    type: UserItemReactionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async addDislike(
    @Request() req: RequestWithUser,
    @Param('item_id', ParseIntPipe) item_id: number,
  ): Promise<UserItemReactionResponseDto> {
    const reaction = await this.reactionService.addDislike(
      req.user.id,
      item_id,
    );

    return {
      id: reaction.id,
      user_id: reaction.user_id,
      item_id: reaction.item_id,
      reaction: reaction.reaction,
      updated_at: reaction.updated_at,
    };
  }

  @Delete(':item_id/dislike')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove dislike',
    description: 'Remove a dislike reaction for a movie',
  })
  @ApiParam({
    name: 'item_id',
    type: Number,
    description: 'Movie ID',
    example: 550,
  })
  @ApiResponse({
    status: 204,
    description: 'Dislike removed successfully',
  })
  @ApiNotFoundResponse({ description: 'Dislike not found' })
  @ApiConflictResponse({ description: 'Reaction is not a dislike' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async removeDislike(
    @Request() req: RequestWithUser,
    @Param('item_id', ParseIntPipe) item_id: number,
  ): Promise<void> {
    await this.reactionService.removeDislike(req.user.id, item_id);
  }
}
