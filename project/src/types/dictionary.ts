export interface Translation {
  word: string;
  pronunciation?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: string[];
    examples?: string[];
  }>;
  phonetic?: string;
}

export interface SearchResult {
  translation: Translation;
  confidence: number;
  alternatives?: Translation[];
}

export interface DictionaryState {
  isLoading: boolean;
  currentResult: Translation | null;
  recentSearches: string[];
  favorites: string[];
  suggestions: string[];
  searchHistory: Array<{
    query: string;
    timestamp: number;
    direction: 'ru-fa' | 'fa-ru';
  }>;
}

export type Direction = 'ru-fa' | 'fa-ru';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ru' | 'fa';