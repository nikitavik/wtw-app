import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from './reaction-type.enum';

export class UserItemReactionResponseDto {
  @ApiProperty({ description: 'Reaction ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  user_id: string;

  @ApiProperty({ description: 'Movie ID', example: 550 })
  item_id: number;

  @ApiProperty({
    description: 'Reaction type',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  reaction: ReactionType;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}
