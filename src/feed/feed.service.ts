import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../catalog/movie.entity';
import { UserProfile } from '../profile/user-profile.entity';
import { WatchlistItem } from '../watchlist/watchlist-item.entity';
import { UserItemReaction } from '../reaction/user-item-reaction.entity';
import { ReactionType } from '../reaction/reaction-type.enum';
import type { MovieResponse } from '../catalog/movie.dto';
import type { PersonalFeedResponseDto } from './feed.dto';

interface ScoredMovie {
  movie: Movie;
  score: number;
  genreScore: number;
  popNorm: number;
  fresh: number;
}

@Injectable()
export class FeedService {
  private readonly FEED_LIMIT = 20;
  private readonly CANDIDATE_LIMITS = {
    POPULAR: 500,
    FRESH: 300,
    BY_GENRE: 200,
  };
  private readonly SCORE_WEIGHTS = {
    GENRE: 0.65,
    POPULARITY: 0.3,
    FRESH: 0.05,
  };
  private readonly MMR_LAMBDA = 0.75;
  private readonly FRESH_DECAY_DAYS = 45;

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
    @InjectRepository(UserItemReaction)
    private readonly reactionRepository: Repository<UserItemReaction>,
  ) {}

  async getPersonalFeed(userId: string): Promise<PersonalFeedResponseDto> {
    // 1. Получаем профиль пользователя
    const profile = await this.userProfileRepository.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // 2. Получаем исключенные ID (liked + watchlist)
    const [likedItems, watchlistItems] = await Promise.all([
      this.reactionRepository.find({
        where: { user_id: userId, reaction: ReactionType.LIKE },
        select: ['item_id'],
      }),
      this.watchlistRepository.find({
        where: { user_id: userId },
        select: ['item_id'],
      }),
    ]);

    const excludedIds = new Set<number>();
    likedItems.forEach((item) => excludedIds.add(item.item_id));
    watchlistItems.forEach((item) => excludedIds.add(item.item_id));

    // 3. Собираем кандидатов
    const candidates = await this.collectCandidates(profile.genre_weights);

    // 4. Исключаем уже просмотренные/в watchlist
    const filteredCandidates = candidates.filter((m) => !excludedIds.has(m.id));

    if (filteredCandidates.length === 0) {
      return { data: [], total: 0 };
    }

    // 5. Скоринг
    const scoredMovies = this.scoreMovies(
      filteredCandidates,
      profile.genre_weights,
    );

    // 6. Diversity (MMR)
    const selectedMovies = this.selectWithMMR(scoredMovies, this.FEED_LIMIT);

    // 7. Преобразуем в MovieResponse
    const data: MovieResponse[] = selectedMovies.map((scored) => ({
      ...scored.movie,
      isInWatchlist: false,
      reaction: null,
    }));

    return { data, total: data.length };
  }

  private async collectCandidates(
    genreWeights: Record<string, number>,
  ): Promise<Movie[]> {
    const candidateSets: Movie[] = [];
    const candidateIds = new Set<number>();

    // Топ популярные (500)
    const popular = await this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.popularity IS NOT NULL')
      .orderBy('movie.popularity', 'DESC')
      .limit(this.CANDIDATE_LIMITS.POPULAR)
      .getMany();

    for (const movie of popular) {
      if (!candidateIds.has(movie.id)) {
        candidateIds.add(movie.id);
        candidateSets.push(movie);
      }
    }

    // Свежие (200-300)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const fresh = await this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.release_date IS NOT NULL')
      .andWhere('movie.release_date >= :sixMonthsAgo', { sixMonthsAgo })
      .orderBy('movie.release_date', 'DESC')
      .limit(this.CANDIDATE_LIMITS.FRESH)
      .getMany();

    for (const movie of fresh) {
      if (!candidateIds.has(movie.id)) {
        candidateIds.add(movie.id);
        candidateSets.push(movie);
      }
    }

    // По топ-жанрам профиля (3-5 жанров × 200)
    const topGenres = this.getTopGenres(genreWeights, 5);
    for (const genre of topGenres) {
      const byGenre = await this.movieRepository
        .createQueryBuilder('movie')
        .where('movie.genres IS NOT NULL')
        .andWhere('LOWER(movie.genres) LIKE LOWER(:genre)', {
          genre: `%${genre}%`,
        })
        .orderBy('movie.popularity', 'DESC')
        .limit(this.CANDIDATE_LIMITS.BY_GENRE)
        .getMany();

      for (const movie of byGenre) {
        if (!candidateIds.has(movie.id)) {
          candidateIds.add(movie.id);
          candidateSets.push(movie);
        }
      }
    }

    return candidateSets;
  }

  private getTopGenres(
    genreWeights: Record<string, number>,
    count: number,
  ): string[] {
    return Object.entries(genreWeights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([genre]) => genre);
  }

  private scoreMovies(
    candidates: Movie[],
    genreWeights: Record<string, number>,
  ): ScoredMovie[] {
    // Парсим жанры для всех кандидатов
    const moviesWithGenres = candidates.map((movie) => ({
      movie,
      genres: movie.genres
        ? movie.genres
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean)
        : [],
    }));

    // 4.1 Genre score
    const genreScores = moviesWithGenres.map(({ genres }) => {
      if (genres.length === 0) return 0;
      const sum = genres.reduce(
        (acc, genre) => acc + (genreWeights[genre] ?? 0),
        0,
      );
      return sum / genres.length;
    });

    // 4.2 Popularity normalization
    const popularities = candidates
      .map((m) => (m.popularity ? Number(m.popularity) : 0))
      .filter((p) => p > 0);
    const popRaw = popularities.map((p) => Math.log(1 + p));
    const eps = 1e-6;
    let minPop = 0;
    let maxPop = 1;
    if (popRaw.length > 0) {
      minPop = Math.min(...popRaw);
      maxPop = Math.max(...popRaw);
    }
    const popNorm = candidates.map((m) => {
      if (!m.popularity || Number(m.popularity) === 0) return 0;
      const raw = Math.log(1 + Number(m.popularity));
      return (raw - minPop) / (maxPop - minPop + eps);
    });

    // 4.3 Fresh score
    const now = new Date();
    const freshScores = candidates.map((m) => {
      if (!m.release_date) return 0;
      const releaseDate = new Date(m.release_date);
      const daysSinceRelease =
        (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
      return Math.exp(-daysSinceRelease / this.FRESH_DECAY_DAYS);
    });

    // 4.4 Итоговый score
    return candidates.map((movie, idx) => ({
      movie,
      score:
        this.SCORE_WEIGHTS.GENRE * genreScores[idx] +
        this.SCORE_WEIGHTS.POPULARITY * popNorm[idx] +
        this.SCORE_WEIGHTS.FRESH * freshScores[idx],
      genreScore: genreScores[idx],
      popNorm: popNorm[idx],
      fresh: freshScores[idx],
    }));
  }

  private selectWithMMR(
    scoredMovies: ScoredMovie[],
    limit: number,
  ): ScoredMovie[] {
    if (scoredMovies.length === 0) return [];
    if (scoredMovies.length <= limit) return scoredMovies;

    // Сортируем по score для начального выбора
    const sorted = [...scoredMovies].sort((a, b) => b.score - a.score);
    const selected: ScoredMovie[] = [sorted[0]];

    // MMR итеративный выбор
    const remaining = sorted.slice(1);

    while (selected.length < limit && remaining.length > 0) {
      let bestIdx = 0;
      let bestMMR = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const maxSim = this.maxSimilarity(candidate, selected);
        const mmr =
          this.MMR_LAMBDA * candidate.score - (1 - this.MMR_LAMBDA) * maxSim;

        if (mmr > bestMMR) {
          bestMMR = mmr;
          bestIdx = i;
        }
      }

      selected.push(remaining[bestIdx]);
      remaining.splice(bestIdx, 1);
    }

    return selected;
  }

  private maxSimilarity(
    candidate: ScoredMovie,
    selected: ScoredMovie[],
  ): number {
    if (selected.length === 0) return 0;

    const candidateGenres = candidate.movie.genres
      ? candidate.movie.genres
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    let maxSim = 0;
    for (const selectedMovie of selected) {
      const selectedGenres = selectedMovie.movie.genres
        ? selectedMovie.movie.genres
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean)
        : [];

      const sim = this.jaccardSimilarity(candidateGenres, selectedGenres);
      maxSim = Math.max(maxSim, sim);
    }

    return maxSim;
  }

  private jaccardSimilarity(setA: string[], setB: string[]): number {
    if (setA.length === 0 && setB.length === 0) return 0;
    const intersection = setA.filter((g) => setB.includes(g)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }
}
