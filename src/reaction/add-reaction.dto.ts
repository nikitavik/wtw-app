import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EventSource } from '../event/event-source.enum';

export class AddReactionDto {
  @ApiProperty({
    description: 'Source',
    enum: EventSource,
    example: EventSource.CATALOG,
  })
  @IsEnum(EventSource)
  source: EventSource;
}
