// Константы для агрегации профиля

export const AGGREGATION_CONSTANTS = {
  // Окно агрегации (дни)
  DEFAULT_WINDOW_DAYS: 90,

  // Time-decay параметры
  DECAY_HALFLIFE_DAYS: 30,

  // Веса для разных типов событий (ключи соответствуют EventType enum)
  EVENT_WEIGHTS: {
    view: 0.5,
    like: 2.0,
    remove_like: -1.0,
    dislike: -1.5,
    remove_dislike: 0.5,
    add_to_watchlist: 1.5,
    remove_from_watchlist: -0.5,
  } as Record<string, number>,

  // Множители источников (если нужно)
  SOURCE_MULTIPLIERS: {
    CATALOG: 1.0,
    // Добавить другие источники при необходимости
  },

  // Ограничения для весов
  WEIGHT_CLAMP: {
    MIN: -5,
    MAX: 5,
  },

  // Топ-N для весов
  TOP_GENRES_COUNT: 15,
  TOP_DECADES_COUNT: 5,
  TOP_LANGUAGES_COUNT: 5,

  // Пороги для preference_confidence
  CONFIDENCE_THRESHOLDS: {
    LOW: 0.3,
    MEDIUM: 0.7,
  },
} as const;
