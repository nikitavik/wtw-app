import { Controller, Get, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FeedService } from './feed.service';
import type { RequestWithUser } from '../shared/lib/types';
import { PersonalFeedResponseDto } from './feed.dto';

@ApiTags('feed')
@Controller('feed')
@ApiBearerAuth()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('personal')
  @ApiOperation({
    summary: 'Get personal feed',
    description: 'Retrieve personalized feed for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Personal feed retrieved successfully',
    type: PersonalFeedResponseDto,
  })
  async getPersonalFeed(
    @Request() req: RequestWithUser,
  ): Promise<PersonalFeedResponseDto> {
    return this.feedService.getPersonalFeed(req.user.id);
  }
}
