/*
  # Remove frequency, difficulty and etymology fields

  1. Changes to Tables
    - Remove `frequency` column from `rus_words` table
    - Remove `difficulty` column from `rus_words` table  
    - Remove `etymology` column from `rus_words` table
    - Remove `frequency` column from `pers_words` table
    - Remove `difficulty` column from `pers_words` table
    - Remove `etymology` column from `pers_words` table

  2. Index Changes
    - Drop indexes related to removed columns
    - Keep search and word indexes

  3. Constraint Changes
    - Remove check constraints for frequency and difficulty
*/

-- Drop indexes for removed columns
DROP INDEX IF EXISTS idx_rus_words_frequency;
DROP INDEX IF EXISTS idx_rus_words_difficulty;
DROP INDEX IF EXISTS idx_pers_words_frequency;
DROP INDEX IF EXISTS idx_pers_words_difficulty;

-- Drop check constraints
ALTER TABLE rus_words DROP CONSTRAINT IF EXISTS rus_words_frequency_check;
ALTER TABLE rus_words DROP CONSTRAINT IF EXISTS rus_words_difficulty_check;
ALTER TABLE pers_words DROP CONSTRAINT IF EXISTS pers_words_frequency_check;
ALTER TABLE pers_words DROP CONSTRAINT IF EXISTS pers_words_difficulty_check;

-- Remove columns from rus_words table
ALTER TABLE rus_words DROP COLUMN IF EXISTS frequency;
ALTER TABLE rus_words DROP COLUMN IF EXISTS difficulty;
ALTER TABLE rus_words DROP COLUMN IF EXISTS etymology;

-- Remove columns from pers_words table
ALTER TABLE pers_words DROP COLUMN IF EXISTS frequency;
ALTER TABLE pers_words DROP COLUMN IF EXISTS difficulty;
ALTER TABLE pers_words DROP COLUMN IF EXISTS etymology;