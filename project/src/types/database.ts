// Database entity types
export interface DatabaseWord {
  id: string;
  word: string;
  phonetic?: string;
  part_of_speech: string;
  translation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseExample {
  id: string;
  word_id: string;
  example_text: string;
  translation: string;
  created_at?: string;
}

export interface DatabaseTranslation {
  id: string;
  rus_word_id: string;
  pers_word_id: string;
  definition: string;
  confidence?: number;
  created_at?: string;
}

// Extended types with relations
export interface WordWithExamples extends DatabaseWord {
  examples?: DatabaseExample[];
}

export interface WordWithTranslations extends DatabaseWord {
  examples?: DatabaseExample[];
  translations?: Array<{
    definition: string;
    confidence?: number;
    related_word?: {
      word: string;
      phonetic?: string;
      part_of_speech: string;
    };
  }>;
}

// Supabase response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface SupabaseListResponse<T> {
  data: T[] | null;
  error: any;
}

// Query builder types
export interface SearchFilters {
  partOfSpeech?: string;
  hasExamples?: boolean;
  hasTranslations?: boolean;
  minConfidence?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Statistics types
export interface DatabaseStats {
  totalWords: number;
  totalExamples: number;
  totalTranslations: number;
  averageConfidence: number;
  lastUpdated: string;
}