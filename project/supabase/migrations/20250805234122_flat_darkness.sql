/*
  # Improve search indexes for better suggestions

  1. Indexes
    - Add better indexes for word search
    - Add trigram indexes for fuzzy search
    - Add functional indexes for case-insensitive search

  2. Performance
    - Optimize search queries
    - Add text search vectors
*/

-- Enable pg_trgm extension for trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_rus_words_word;
DROP INDEX IF EXISTS idx_pers_words_word;

-- Create better indexes for word search
CREATE INDEX IF NOT EXISTS idx_rus_words_word_lower ON public.rus_words USING btree (lower(word));
CREATE INDEX IF NOT EXISTS idx_pers_words_word_lower ON public.pers_words USING btree (lower(word));

-- Create trigram indexes for fuzzy search and suggestions
CREATE INDEX IF NOT EXISTS idx_rus_words_word_trgm ON public.rus_words USING gin (word gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pers_words_word_trgm ON public.pers_words USING gin (word gin_trgm_ops);

-- Create prefix indexes for fast autocomplete
CREATE INDEX IF NOT EXISTS idx_rus_words_word_prefix ON public.rus_words USING btree (word text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_pers_words_word_prefix ON public.pers_words USING btree (word text_pattern_ops);

-- Update existing word indexes to be case-insensitive
CREATE INDEX IF NOT EXISTS idx_rus_words_word_ci ON public.rus_words USING btree (upper(word));
CREATE INDEX IF NOT EXISTS idx_pers_words_word_ci ON public.pers_words USING btree (upper(word));

-- Add indexes for translation columns
CREATE INDEX IF NOT EXISTS idx_rus_words_translation_search ON public.rus_words USING gin (to_tsvector('russian'::regconfig, COALESCE(translation, '')));
CREATE INDEX IF NOT EXISTS idx_pers_words_translation_search ON public.pers_words USING gin (to_tsvector('simple'::regconfig, COALESCE(translation, '')));

-- Analyze tables to update statistics
ANALYZE public.rus_words;
ANALYZE public.pers_words;