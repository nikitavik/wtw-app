export type ProfileStats = {
  // Активность
  events_total_90d: number;
  last_event_at: string | null;
  active_days_90d: number;

  // Счётчики по типам событий (в окне)
  views_count_90d: number;
  likes_count_90d: number;
  unlikes_count_90d: number;
  watchlist_add_count_90d: number;
  watchlist_remove_count_90d: number;

  // Состояния (из state-таблиц)
  liked_items_count: number;
  watchlist_items_count: number;

  // Надёжность профиля
  preference_confidence: number;

  // Дополнительные метрики
  taste_diversity: number;
};

export type GenreWeights = Record<string, number>;
export type DecadeWeights = Record<string, number>;
export type LanguageWeights = Record<string, number>;
