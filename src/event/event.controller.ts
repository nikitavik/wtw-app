import { Controller, Get, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { EventBusService } from './event-bus.service';
import { UserEvent } from './user-event.entity';

import type { RequestWithUser } from '../shared/lib/types';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventBusService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user events',
    description: 'Get all events for a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [UserEvent],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUserEvents(@Request() req: RequestWithUser): Promise<UserEvent[]> {
    return this.eventService.getUserEvents(req.user.id);
  }
}
