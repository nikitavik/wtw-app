import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserItemReaction } from 'src/reaction';
import { WatchlistItem } from 'src/watchlist/watchlist-item.entity';
import { ReactionType } from 'src/reaction/reaction-type.enum';

@Entity('movies')
export class Movie {
  @ApiProperty({ description: 'Movie ID', example: 550 })
  @PrimaryColumn('int')
  id: number;

  @ApiProperty({
    description: 'Movie title',
    example: 'Fight Club',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @ApiProperty({
    description: 'Original movie title',
    example: 'Fight Club',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  original_title: string;

  @ApiProperty({
    description: 'Movie overview',
    example: 'A ticking-time-bomb insomniac...',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  overview: string;

  @ApiProperty({
    description: 'Movie tagline',
    example: 'Mischief. Mayhem. Soap.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  tagline: string;

  @ApiProperty({
    description: 'Release date',
    example: '1999-10-15',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  release_date: Date;

  @ApiProperty({
    description: 'Movie budget',
    example: 63000000,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @ApiProperty({
    description: 'Movie revenue',
    example: 100853753,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  revenue: number;

  @ApiProperty({
    description: 'Movie runtime in minutes',
    example: 139,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  runtime: number;

  @ApiProperty({
    description: 'Movie status',
    example: 'Released',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @ApiProperty({
    description: 'Adult content flag',
    example: false,
    nullable: true,
  })
  @Column({ type: 'boolean', nullable: true })
  adult: boolean;

  @ApiProperty({ description: 'Video flag', example: false, nullable: true })
  @Column({ type: 'boolean', nullable: true })
  video: boolean;

  @ApiProperty({
    description: 'Popularity score',
    example: 73.734,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  popularity: number;

  @ApiProperty({
    description: 'Average vote score',
    example: 8.4,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  vote_average: number;

  @ApiProperty({
    description: 'Total vote count',
    example: 26280,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  vote_count: number;

  @ApiProperty({ description: 'IMDB ID', example: 'tt0137523', nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  imdb_id: string;

  @ApiProperty({
    description: 'Original language code',
    example: 'en',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  original_language: string;

  @ApiProperty({
    description: 'Movie homepage URL',
    example: 'https://www.foxmovies.com/movies/fight-club',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  homepage: string;

  @ApiProperty({
    description: 'Poster path',
    example: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  poster_path: string;

  @ApiProperty({
    description: 'Collection name',
    example: 'Fight Club Collection',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  collection_name: string;

  @ApiProperty({
    description: 'Genres',
    example: 'Drama, Thriller',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  genres: string;

  @ApiProperty({
    description: 'Production companies',
    example: '20th Century Fox, Regency Enterprises',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  production_companies: string;

  @ApiProperty({
    description: 'Production countries',
    example: 'United States of America',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  production_countries: string;

  @ApiProperty({
    description: 'Spoken languages',
    example: 'English',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  spoken_languages: string;

  @OneToMany(() => UserItemReaction, (reaction) => reaction.movie)
  reactions: UserItemReaction[];

  @OneToMany(() => WatchlistItem, (watchlistItem) => watchlistItem.movie)
  watchlistItems: WatchlistItem[];

  @ApiProperty({
    description: "Whether the movie is in the user's watchlist",
    example: true,
    required: true,
  })
  inWatchlist: boolean;

  @ApiProperty({
    description: "User's reaction to the movie",
    enum: ReactionType,
    example: ReactionType.LIKE,
    nullable: true,
    required: true,
  })
  reaction: ReactionType | null;
}
