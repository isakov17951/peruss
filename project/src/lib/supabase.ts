import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface RusWord {
  id: string;
  word: string;
  phonetic?: string;
  part_of_speech: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersWord {
  id: string;
  word: string;
  phonetic?: string;
  part_of_speech: string;
  created_at?: string;
  updated_at?: string;
}

export interface RusExample {
  id: string;
  word_id: string;
  example_text: string;
  translation: string;
  created_at?: string;
}

export interface PersExample {
  id: string;
  word_id: string;
  example_text: string;
  translation: string;
  created_at?: string;
}

export interface Translation {
  id: string;
  rus_word_id: string;
  pers_word_id: string;
  definition: string;
  confidence?: number;
  created_at?: string;
}