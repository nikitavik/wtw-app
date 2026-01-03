import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../catalog/movie.entity';
import type { MovieResponse } from '../catalog/movie.dto';

export class PersonalFeedResponseDto {
  @ApiProperty({
    description: 'List of recommended movies',
    type: [Movie],
  })
  data: MovieResponse[];

  @ApiProperty({
    description: 'Total number of recommendations',
    example: 20,
  })
  total: number;
}
