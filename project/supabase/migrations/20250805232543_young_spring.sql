/*
  # Add translation columns to word tables

  1. Schema Changes
    - Add `translation` column to `rus_words` table (TEXT)
    - Add `translation` column to `pers_words` table (TEXT)
    - Add indexes for better search performance

  2. Data Population
    - Populate translations for existing words using the translations table
    - Add fallback translations for words without existing translations

  3. Performance
    - Add indexes on new translation columns for faster searches
*/

-- Add translation column to rus_words table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rus_words' AND column_name = 'translation'
  ) THEN
    ALTER TABLE rus_words ADD COLUMN translation TEXT;
  END IF;
END $$;

-- Add translation column to pers_words table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pers_words' AND column_name = 'translation'
  ) THEN
    ALTER TABLE pers_words ADD COLUMN translation TEXT;
  END IF;
END $$;

-- Populate rus_words translation column from existing translations
UPDATE rus_words 
SET translation = (
  SELECT string_agg(t.definition, '; ')
  FROM translations t
  JOIN pers_words pw ON t.pers_word_id = pw.id
  WHERE t.rus_word_id = rus_words.id
)
WHERE EXISTS (
  SELECT 1 FROM translations t WHERE t.rus_word_id = rus_words.id
);

-- Populate pers_words translation column from existing translations
UPDATE pers_words 
SET translation = (
  SELECT string_agg(t.definition, '; ')
  FROM translations t
  JOIN rus_words rw ON t.rus_word_id = rw.id
  WHERE t.pers_word_id = pers_words.id
)
WHERE EXISTS (
  SELECT 1 FROM translations t WHERE t.pers_word_id = pers_words.id
);

-- Add some sample data if tables are empty or have words without translations
INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('привет', 'priˈvʲet', 'междометие', 'سلام، درود')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('дом', 'dom', 'существительное', 'خانه، منزل')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('любовь', 'lʲuˈbofʲ', 'существительное', 'عشق، محبت')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('друг', 'druk', 'существительное', 'دوست، رفیق')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('книга', 'ˈknʲigə', 'существительное', 'کتاب')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('вода', 'vɐˈda', 'существительное', 'آب')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('хлеб', 'xlʲep', 'существительное', 'نان')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('мать', 'matʲ', 'существительное', 'مادر')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('отец', 'ɐˈtʲets', 'существительное', 'پدر')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

INSERT INTO rus_words (word, phonetic, part_of_speech, translation) VALUES
('время', 'ˈvrʲemʲə', 'существительное', 'زمان')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(rus_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(rus_words.phonetic, EXCLUDED.phonetic);

-- Add Persian words
INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('سلام', 'sæˈlɒːm', 'اسم', 'привет, здравствуйте')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('خانه', 'xɒːˈne', 'اسم', 'дом, жилище')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('عشق', 'eʃɣ', 'اسم', 'любовь, страсть')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('دوست', 'dust', 'اسم', 'друг, товарищ')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('کتاب', 'ketɒːb', 'اسم', 'книга')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('آب', 'ɒːb', 'اسم', 'вода')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('نان', 'nɒːn', 'اسم', 'хлеб')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('مادر', 'mɒːˈdær', 'اسم', 'мать')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('پدر', 'peˈdær', 'اسم', 'отец')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

INSERT INTO pers_words (word, phonetic, part_of_speech, translation) VALUES
('زمان', 'zæˈmɒːn', 'اسم', 'время')
ON CONFLICT (word) DO UPDATE SET 
  translation = COALESCE(pers_words.translation, EXCLUDED.translation),
  phonetic = COALESCE(pers_words.phonetic, EXCLUDED.phonetic);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rus_words_translation ON rus_words USING gin (to_tsvector('russian', translation));
CREATE INDEX IF NOT EXISTS idx_pers_words_translation ON pers_words USING gin (to_tsvector('simple', translation));

-- Add search indexes for the translation columns
CREATE INDEX IF NOT EXISTS idx_rus_words_translation_search ON rus_words (translation);
CREATE INDEX IF NOT EXISTS idx_pers_words_translation_search ON pers_words (translation);