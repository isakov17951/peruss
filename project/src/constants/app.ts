// Константы приложения для лучшей maintainability
export const SEARCH_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 10,
  MAX_RECENT_SEARCHES: 10,
  MAX_SEARCH_HISTORY: 50,
  MAX_EXAMPLES: 5,
  STORAGE_SAVE_DELAY: 500,
  SEARCH_MIN_LENGTH: 1,
  SUGGESTION_MIN_LENGTH: 1
} as const;

export const STORAGE_KEYS = {
  RECENT_SEARCHES: 'dictionary-recent-searches',
  FAVORITES: 'dictionary-favorites',
  SEARCH_HISTORY: 'dictionary-search-history',
  USER_PREFERENCES: 'dictionary-user-preferences'
} as const;

export const ERROR_MESSAGES = {
  WORD_NOT_FOUND: 'Слово не найдено в базе данных',
  WORD_NOT_FOUND_FA: 'کلمه در پایگاه داده یافت نشد',
  CONNECTION_ERROR: 'Ошибка подключения к базе данных',
  SEARCH_FAILED: 'Поиск не удался. Попробуйте еще раз',
  TRANSLATION_NOT_FOUND: 'Перевод не найден в базе данных',
  TRANSLATION_NOT_FOUND_FA: 'ترجمه در پایگاه داده یافت نشد',
  NETWORK_ERROR: 'Проблемы с сетью. Проверьте подключение к интернету',
  GENERIC_ERROR: 'Произошла ошибка. Попробуйте позже'
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_SEARCH: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  KEYBOARD_ANIMATION_DURATION: 300
} as const;

export const LANGUAGE_CONSTANTS = {
  RUSSIAN: 'ru',
  PERSIAN: 'fa',
  ENGLISH: 'en'
} as const;

export const DIRECTION_CONSTANTS = {
  RU_TO_FA: 'ru-fa',
  FA_TO_RU: 'fa-ru'
} as const;

export const PART_OF_SPEECH = {
  NOUN: 'noun',
  VERB: 'verb',
  ADJECTIVE: 'adjective',
  ADVERB: 'adverb',
  PREPOSITION: 'preposition',
  CONJUNCTION: 'conjunction',
  INTERJECTION: 'interjection',
  PRONOUN: 'pronoun'
} as const;

// Регулярные выражения для определения языка
export const LANGUAGE_DETECTION = {
  PERSIAN_REGEX: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/,
  RUSSIAN_REGEX: /[\u0400-\u04FF]/,
  LATIN_REGEX: /[a-zA-Z]/
} as const;

// Конфигурация для различных окружений
export const APP_CONFIG = {
  DEVELOPMENT: {
    LOG_LEVEL: 'debug',
    ENABLE_PERFORMANCE_MONITORING: true
  },
  PRODUCTION: {
    LOG_LEVEL: 'error',
    ENABLE_PERFORMANCE_MONITORING: false
  }
} as const;