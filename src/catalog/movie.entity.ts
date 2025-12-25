import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryColumn('int')
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  original_title: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'text', nullable: true })
  tagline: string;

  @Column({ type: 'date', nullable: true })
  release_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  revenue: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  runtime: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @Column({ type: 'boolean', nullable: true })
  adult: boolean;

  @Column({ type: 'boolean', nullable: true })
  video: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  popularity: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  vote_average: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
  vote_count: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  imdb_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  original_language: string;

  @Column({ type: 'text', nullable: true })
  homepage: string;

  @Column({ type: 'text', nullable: true })
  poster_path: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  collection_name: string;

  @Column({ type: 'text', nullable: true })
  genres: string;

  @Column({ type: 'text', nullable: true })
  production_companies: string;

  @Column({ type: 'text', nullable: true })
  production_countries: string;

  @Column({ type: 'text', nullable: true })
  spoken_languages: string;
}
