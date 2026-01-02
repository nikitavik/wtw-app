import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';

import { UserEvent } from '../event/user-event.entity';
import { UserItemReaction } from '../reaction/user-item-reaction.entity';
import { ReactionType } from '../reaction/reaction-type.enum';
import { EventType } from '../event/event-type.enum';
import { UserProfile } from './user-profile.entity';
import { WatchlistItem } from '../watchlist/watchlist-item.entity';
import { Movie } from '../catalog/movie.entity';
import { AGGREGATION_CONSTANTS } from './profile-aggregation.constants';
import type {
  ProfileStats,
  GenreWeights,
  DecadeWeights,
  LanguageWeights,
} from './profile-aggregation.types';

@Injectable()
export class ProfileAggregationService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
    @InjectRepository(UserItemReaction)
    private readonly userItemReactionRepository: Repository<UserItemReaction>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(WatchlistItem)
    private readonly watchlistItemRepository: Repository<WatchlistItem>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async aggregateProfile(
    userId: string,
    windowDays: number = AGGREGATION_CONSTANTS.DEFAULT_WINDOW_DAYS,
  ): Promise<UserProfile> {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - windowDays);

    // Получаем данные за окно
    const [events, reactions, watchlistItems] = await Promise.all([
      this.userEventRepository.find({
        where: {
          user_id: userId,
          created_at: MoreThanOrEqual(windowStart),
        },
        order: { created_at: 'DESC' },
      }),
      this.userItemReactionRepository.find({
        where: { user_id: userId },
      }),
      this.watchlistItemRepository.find({
        where: { user_id: userId },
      }),
    ]);

    // Получаем ID фильмов для загрузки метаданных
    const movieIds = new Set<number>();
    events.forEach((e) => movieIds.add(e.item_id));
    reactions.forEach((r) => movieIds.add(r.item_id));
    watchlistItems.forEach((w) => movieIds.add(w.item_id));

    // Загружаем фильмы с метаданными
    const movies =
      movieIds.size > 0
        ? await this.movieRepository.find({
            where: { id: In(Array.from(movieIds)) },
          })
        : [];

    const movieMap = new Map(movies.map((m) => [m.id, m]));

    // Вычисляем stats
    const stats = this.computeStats(
      events,
      reactions,
      watchlistItems,
      windowStart,
    );

    // Вычисляем веса с time-decay
    const { genreWeights, decadeWeights, languageWeights } =
      this.computeWeights(events, reactions, movieMap, windowStart);

    // Вычисляем taste_diversity
    stats.taste_diversity = this.computeTasteDiversity(genreWeights);

    // Вычисляем preference_confidence
    stats.preference_confidence = this.computePreferenceConfidence(stats);

    // Подготавливаем данные для сохранения
    const likedItems: number[] = [];
    const dislikedItems: number[] = [];

    for (const reaction of reactions) {
      if (reaction.reaction === ReactionType.LIKE) {
        likedItems.push(reaction.item_id);
      } else if (reaction.reaction === ReactionType.DISLIKE) {
        dislikedItems.push(reaction.item_id);
      }
    }

    const lastEvent = events[0]?.created_at ?? null;

    const aggregatedProfile = this.userProfileRepository.create({
      user_id: userId,
      profile_version: 1,
      window_days: windowDays,
      computed_at: new Date(),
      genre_weights: genreWeights,
      decade_weights: decadeWeights,
      language_weights: languageWeights,
      stats: stats as Record<string, unknown>,
      // Legacy fields для обратной совместимости
      total_events: events.length,
      like_count: likedItems.length,
      dislike_count: dislikedItems.length,
      last_event_at: lastEvent,
      liked_items: likedItems,
      disliked_items: dislikedItems,
    });

    return await this.userProfileRepository.save(aggregatedProfile);
  }

  private computeStats(
    events: UserEvent[],
    reactions: UserItemReaction[],
    watchlistItems: WatchlistItem[],
    windowStart: Date,
  ): ProfileStats {
    // Активность
    const eventsInWindow = events.filter(
      (e) => e.created_at >= windowStart,
    ).length;
    const lastEventAt = events[0]?.created_at.toISOString() ?? null;

    // Активные дни
    const activeDaysSet = new Set<string>();
    events.forEach((e) => {
      if (e.created_at >= windowStart) {
        const dayKey = e.created_at.toISOString().split('T')[0];
        activeDaysSet.add(dayKey);
      }
    });
    const activeDays90d = activeDaysSet.size;

    // Счётчики по типам событий
    const viewsCount90d = events.filter(
      (e) => e.event_type === EventType.VIEW && e.created_at >= windowStart,
    ).length;
    const likesCount90d = events.filter(
      (e) => e.event_type === EventType.LIKE && e.created_at >= windowStart,
    ).length;
    const unlikesCount90d = events.filter(
      (e) =>
        e.event_type === EventType.REMOVE_LIKE && e.created_at >= windowStart,
    ).length;
    const watchlistAddCount90d = events.filter(
      (e) =>
        e.event_type === EventType.ADD_TO_WATCHLIST &&
        e.created_at >= windowStart,
    ).length;
    const watchlistRemoveCount90d = events.filter(
      (e) =>
        e.event_type === EventType.REMOVE_FROM_WATCHLIST &&
        e.created_at >= windowStart,
    ).length;

    // Состояния (текущие)
    const likedItemsCount = reactions.filter(
      (r) => r.reaction === ReactionType.LIKE,
    ).length;
    const watchlistItemsCount = watchlistItems.length;

    return {
      events_total_90d: eventsInWindow,
      last_event_at: lastEventAt,
      active_days_90d: activeDays90d,
      views_count_90d: viewsCount90d,
      likes_count_90d: likesCount90d,
      unlikes_count_90d: unlikesCount90d,
      watchlist_add_count_90d: watchlistAddCount90d,
      watchlist_remove_count_90d: watchlistRemoveCount90d,
      liked_items_count: likedItemsCount,
      watchlist_items_count: watchlistItemsCount,
      preference_confidence: 0, // Будет вычислено позже
      taste_diversity: 0, // Будет вычислено позже
    };
  }

  private computeWeights(
    events: UserEvent[],
    reactions: UserItemReaction[],
    movieMap: Map<number, Movie>,
    windowStart: Date,
  ): {
    genreWeights: GenreWeights;
    decadeWeights: DecadeWeights;
    languageWeights: LanguageWeights;
  } {
    const genreWeightsMap = new Map<string, number>();
    const decadeWeightsMap = new Map<string, number>();
    const languageWeightsMap = new Map<string, number>();

    const now = new Date();

    // Обрабатываем события
    for (const event of events) {
      if (event.created_at < windowStart) continue;

      const movie = movieMap.get(event.item_id);
      if (!movie) continue;

      const decay = this.computeTimeDecay(event.created_at, now);
      const eventWeight =
        AGGREGATION_CONSTANTS.EVENT_WEIGHTS[event.event_type] ?? 0;
      const weight = eventWeight * decay;

      this.addMovieWeights(
        movie,
        weight,
        genreWeightsMap,
        decadeWeightsMap,
        languageWeightsMap,
      );
    }

    // Обрабатываем реакции (они важнее, используем больший вес)
    for (const reaction of reactions) {
      const movie = movieMap.get(reaction.item_id);
      if (!movie) continue;

      // Для реакций используем фиксированный decay (они актуальны)
      const reactionWeight =
        reaction.reaction === ReactionType.LIKE ? 2.0 : -1.5;

      this.addMovieWeights(
        movie,
        reactionWeight,
        genreWeightsMap,
        decadeWeightsMap,
        languageWeightsMap,
      );
    }

    // Нормализуем и ограничиваем веса
    const genreWeights = this.normalizeAndClampWeights(
      genreWeightsMap,
      AGGREGATION_CONSTANTS.TOP_GENRES_COUNT,
    );
    const decadeWeights = this.normalizeAndClampWeights(
      decadeWeightsMap,
      AGGREGATION_CONSTANTS.TOP_DECADES_COUNT,
    );
    const languageWeights = this.normalizeAndClampWeights(
      languageWeightsMap,
      AGGREGATION_CONSTANTS.TOP_LANGUAGES_COUNT,
    );

    return { genreWeights, decadeWeights, languageWeights };
  }

  private addMovieWeights(
    movie: Movie,
    weight: number,
    genreWeightsMap: Map<string, number>,
    decadeWeightsMap: Map<string, number>,
    languageWeightsMap: Map<string, number>,
  ): void {
    // Жанры
    if (movie.genres) {
      const genres = movie.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
      const weightPerGenre = weight / genres.length;

      for (const genre of genres) {
        const current = genreWeightsMap.get(genre) ?? 0;
        genreWeightsMap.set(genre, current + weightPerGenre);
      }
    }

    // Десятилетие
    if (movie.release_date) {
      const year = new Date(movie.release_date).getFullYear();
      const decade = `${Math.floor(year / 10) * 10}s`;
      const current = decadeWeightsMap.get(decade) ?? 0;
      decadeWeightsMap.set(decade, current + weight);
    }

    // Языки
    if (movie.spoken_languages) {
      const languages = movie.spoken_languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      const weightPerLanguage = weight / languages.length;

      for (const language of languages) {
        const current = languageWeightsMap.get(language) ?? 0;
        languageWeightsMap.set(language, current + weightPerLanguage);
      }
    }
  }

  private computeTimeDecay(eventDate: Date, now: Date): number {
    const deltaDays =
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-deltaDays / AGGREGATION_CONSTANTS.DECAY_HALFLIFE_DAYS);
  }

  private normalizeAndClampWeights(
    weightsMap: Map<string, number>,
    topN: number,
  ): Record<string, number> {
    // Сортируем и берём топ-N
    const sorted = Array.from(weightsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    // Clamp значения
    const clamped: Record<string, number> = {};
    for (const [key, value] of sorted) {
      clamped[key] = Math.max(
        AGGREGATION_CONSTANTS.WEIGHT_CLAMP.MIN,
        Math.min(AGGREGATION_CONSTANTS.WEIGHT_CLAMP.MAX, value),
      );
    }

    return clamped;
  }

  private computeTasteDiversity(genreWeights: GenreWeights): number {
    const weights = Object.values(genreWeights);
    if (weights.length === 0) return 0;

    const total = weights.reduce((sum, w) => sum + Math.abs(w), 0);
    if (total === 0) return 0;

    // Нормализуем веса
    const normalized = weights.map((w) => Math.abs(w) / total);

    // Вычисляем энтропию Шеннона (мера разнообразия)
    let entropy = 0;
    for (const p of normalized) {
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    // Нормализуем к [0, 1]
    const maxEntropy = Math.log2(normalized.length);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  private computePreferenceConfidence(stats: ProfileStats): number {
    const { likes_count_90d, watchlist_add_count_90d, active_days_90d } = stats;

    // Базовые сигналы
    const signalLikes = Math.min(likes_count_90d / 10, 1.0);
    const signalWatchlist = Math.min(watchlist_add_count_90d / 5, 1.0);
    const signalActivity = Math.min(active_days_90d / 30, 1.0);

    // Комбинируем с весами
    const confidence =
      signalLikes * 0.5 + signalWatchlist * 0.3 + signalActivity * 0.2;

    // Clamp к [0, 1]
    return Math.max(0, Math.min(1, confidence));
  }
}
