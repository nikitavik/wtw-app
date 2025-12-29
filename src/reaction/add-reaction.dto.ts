import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EventSource } from '../event/event-source.enum';

export class AddReactionDto {
  @ApiProperty({
    description: 'Source',
    enum: EventSource,
    example: EventSource.CATALOG,
  })
  @IsNotEmpty({ message: 'Source is required' })
  @IsEnum(EventSource, { message: 'Source must be a valid EventSource' })
  source: EventSource;
}
