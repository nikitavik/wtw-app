import {
  Controller,
  Post,
  Delete,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { AddWatchlistItemDto, WatchlistItemResponseDto } from './watchlist.dto';
import type { RequestWithUser } from '../shared/lib/types';

@ApiTags('watchlist')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get watchlist',
    description: 'Get the user watchlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Watchlist retrieved successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async get(
    @Request() req: RequestWithUser,
  ): Promise<WatchlistItemResponseDto[]> {
    return this.watchlistService.getWatchlist(req.user.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add item to watchlist',
    description: 'Add a movie to the user watchlist',
  })
  @ApiBody({ type: AddWatchlistItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to watchlist successfully',
    type: WatchlistItemResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async add(
    @Request() req: RequestWithUser,
    @Body() addDto: AddWatchlistItemDto,
  ): Promise<WatchlistItemResponseDto> {
    const item = await this.watchlistService.addItem(
      req.user.id,
      addDto.item_id,
      addDto.source,
    );

    return {
      id: item.id,
      user_id: item.user_id,
      item_id: item.item_id,
      source: item.source,
      created_at: item.created_at,
    };
  }

  @Delete(':item_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove item from watchlist',
    description: 'Remove a movie from the user watchlist',
  })
  @ApiParam({
    name: 'item_id',
    type: Number,
    description: 'Movie ID',
    example: 550,
  })
  @ApiResponse({
    status: 204,
    description: 'Item removed from watchlist successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(
    @Request() req: RequestWithUser,
    @Param('item_id', ParseIntPipe) item_id: number,
  ): Promise<void> {
    await this.watchlistService.removeItem(req.user.id, item_id);
  }
}
