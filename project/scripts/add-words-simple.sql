/*
  Simple SQL script to add new words to the dictionary

  Usage:
    1. Edit the VALUES sections below with your words
    2. Run this in Supabase SQL Editor
    3. Check the results

  Template for adding a word pair:
    - Replace 'RUSSIAN_WORD' with your Russian word
    - Replace 'PERSIAN_WORD' with your Persian word
    - Adjust other fields as needed
*/

-- ============================================
-- ADD NEW RUSSIAN-PERSIAN WORD PAIR
-- ============================================

-- Step 1: Add Russian word
INSERT INTO rus_words (word, phonetic, part_of_speech, frequency, difficulty, etymology)
VALUES (
  'RUSSIAN_WORD',              -- Russian word (required)
  'phonetic',                  -- Phonetic transcription (optional, can be NULL)
  'существительное',           -- Part of speech (required)
                               -- Options: существительное, глагол, прилагательное,
                               --          наречие, предлог, союз, междометие, местоимение
  'частое',                    -- Frequency (optional, default: 'частое')
                               -- Options: частое, редкое, очень редкое
  'начальный',                 -- Difficulty (optional, default: 'начальный')
                               -- Options: начальный, средний, продвинутый
  'Etymology info'             -- Etymology (optional, can be NULL)
)
ON CONFLICT (word) DO NOTHING;

-- Step 2: Add Persian word
INSERT INTO pers_words (word, phonetic, part_of_speech, frequency, difficulty, etymology)
VALUES (
  'PERSIAN_WORD',              -- Persian word (required)
  'phonetic',                  -- Phonetic transcription (optional, can be NULL)
  'существительное',           -- Part of speech (required)
  'частое',                    -- Frequency
  'начальный',                 -- Difficulty
  'Etymology info'             -- Etymology (optional, can be NULL)
)
ON CONFLICT (word) DO NOTHING;

-- Step 3: Link the translation
INSERT INTO translations (rus_word_id, pers_word_id, definition, confidence)
SELECT
  (SELECT id FROM rus_words WHERE word = 'RUSSIAN_WORD'),
  (SELECT id FROM pers_words WHERE word = 'PERSIAN_WORD'),
  'Definition or translation explanation',  -- Definition (required)
  100                                        -- Confidence 1-100 (optional, default: 100)
)
ON CONFLICT (rus_word_id, pers_word_id) DO NOTHING;

-- Step 4: Add Russian examples (optional)
INSERT INTO rus_examples (word_id, example_text, translation)
SELECT
  (SELECT id FROM rus_words WHERE word = 'RUSSIAN_WORD'),
  'Example sentence in Russian',              -- Russian example
  'Translation to Persian'                    -- Persian translation
)
-- Add more examples by repeating the SELECT with different sentences
UNION ALL
SELECT
  (SELECT id FROM rus_words WHERE word = 'RUSSIAN_WORD'),
  'Another example in Russian',
  'Another Persian translation'
;

-- Step 5: Add Persian examples (optional)
INSERT INTO pers_examples (word_id, example_text, translation)
SELECT
  (SELECT id FROM pers_words WHERE word = 'PERSIAN_WORD'),
  'Example sentence in Persian',              -- Persian example
  'Translation to Russian'                    -- Russian translation
UNION ALL
SELECT
  (SELECT id FROM pers_words WHERE word = 'PERSIAN_WORD'),
  'Another example in Persian',
  'Another Russian translation'
;


-- ============================================
-- EXAMPLE: Adding "teacher" / "معلم"
-- ============================================

-- Add Russian word
INSERT INTO rus_words (word, phonetic, part_of_speech, frequency, difficulty, etymology)
VALUES (
  'учитель',
  'uˈtɕitʲelʲ',
  'существительное',
  'частое',
  'начальный',
  'От учить'
)
ON CONFLICT (word) DO NOTHING;

-- Add Persian word
INSERT INTO pers_words (word, phonetic, part_of_speech, frequency, difficulty, etymology)
VALUES (
  'معلم',
  'moælˈlem',
  'существительное',
  'частое',
  'начальный',
  'Из арабского معلم'
)
ON CONFLICT (word) DO NOTHING;

-- Link translation
INSERT INTO translations (rus_word_id, pers_word_id, definition, confidence)
SELECT
  (SELECT id FROM rus_words WHERE word = 'учитель'),
  (SELECT id FROM pers_words WHERE word = 'معلم'),
  'лицо, которое обучает чему-либо',
  100
)
ON CONFLICT (rus_word_id, pers_word_id) DO NOTHING;

-- Add examples
INSERT INTO rus_examples (word_id, example_text, translation)
SELECT
  (SELECT id FROM rus_words WHERE word = 'учитель'),
  'Мой учитель очень добрый',
  'معلم من خیلی مهربان است'
UNION ALL
SELECT
  (SELECT id FROM rus_words WHERE word = 'учитель'),
  'Учитель объясняет урок',
  'معلم درس را توضیح می‌دهد'
;

INSERT INTO pers_examples (word_id, example_text, translation)
SELECT
  (SELECT id FROM pers_words WHERE word = 'معلم'),
  'معلم ما خیلی خوب است',
  'Наш учитель очень хороший'
UNION ALL
SELECT
  (SELECT id FROM pers_words WHERE word = 'معلم'),
  'معلم در کلاس است',
  'Учитель в классе'
;
