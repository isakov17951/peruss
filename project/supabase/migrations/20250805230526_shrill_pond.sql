/*
  # Insert updated sample data without frequency, difficulty, etymology

  1. Sample Data
    - Russian words with basic information
    - Persian words with basic information
    - Examples for both languages
    - Translation relationships

  Note: This replaces the previous sample data with simplified structure
*/

-- Clear existing data
DELETE FROM translations;
DELETE FROM rus_examples;
DELETE FROM pers_examples;
DELETE FROM rus_words;
DELETE FROM pers_words;

-- Insert Russian words (simplified)
INSERT INTO rus_words (word, phonetic, part_of_speech) VALUES
('привет', 'priˈvʲet', 'междометие'),
('дом', 'dom', 'существительное'),
('любовь', 'lʲuˈbofʲ', 'существительное'),
('работа', 'raˈbota', 'существительное'),
('семья', 'sʲɪˈmʲja', 'существительное'),
('время', 'ˈvrʲemʲə', 'существительное'),
('жизнь', 'ʐɨzʲnʲ', 'существительное'),
('друг', 'druk', 'существительное'),
('вода', 'vaˈda', 'существительное'),
('солнце', 'ˈsont͡sə', 'существительное');

-- Insert Persian words (simplified)
INSERT INTO pers_words (word, phonetic, part_of_speech) VALUES
('سلام', 'sæˈlɒːm', 'междометие'),
('خانه', 'xɒːˈne', 'существительное'),
('عشق', 'eʃɣ', 'существительное'),
('کار', 'kɒːr', 'существительное'),
('خانواده', 'xɒːneˈvɒːde', 'существительное'),
('زمان', 'zæˈmɒːn', 'существительное'),
('زندگی', 'zendeˈɡiː', 'существительное'),
('دوست', 'dust', 'существительное'),
('آب', 'ɒːb', 'существительное'),
('خورشید', 'xoɾˈʃiːd', 'существительное');

-- Insert Russian examples
INSERT INTO rus_examples (word_id, example_text, translation) 
SELECT id, example_text, translation FROM (
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'привет') as id,
    'Привет, как дела?' as example_text,
    'سلام، چطوری؟' as translation
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'привет'),
    'Привет всем!',
    'سلام به همه!'
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'дом'),
    'Мой дом очень красивый.',
    'خانه من خیلی زیبا است.'
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'дом'),
    'Он идёт домой.',
    'او به خانه می‌رود.'
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'любовь'),
    'Любовь к семье очень важна.',
    'عشق به خانواده خیلی مهم است.'
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'любовь'),
    'Это настоящая любовь.',
    'این عشق واقعی است.'
) examples;

-- Insert Persian examples
INSERT INTO pers_examples (word_id, example_text, translation)
SELECT id, example_text, translation FROM (
  SELECT 
    (SELECT id FROM pers_words WHERE word = 'سلام') as id,
    'سلام برادر' as example_text,
    'привет, брат' as translation
  UNION ALL
  SELECT 
    (SELECT id FROM pers_words WHERE word = 'سلام'),
    'سلام و درود',
    'привет и приветствие'
  UNION ALL
  SELECT 
    (SELECT id FROM pers_words WHERE word = 'خانه'),
    'خانه بزرگ و زیبا',
    'большой и красивый дом'
  UNION ALL
  SELECT 
    (SELECT id FROM pers_words WHERE word = 'خانه'),
    'به خانه برمی‌گردم',
    'возвращаюсь домой'
  UNION ALL
  SELECT 
    (SELECT id FROM pers_words WHERE word = 'عشق'),
    'عشق واقعی و پاک',
    'настоящая и чистая любовь'
  UNION ALL
  SELECT 
    (SELECT id FROM pers_words WHERE word = 'عشق'),
    'عشق مادری',
    'материнская любовь'
) examples;

-- Insert translations
INSERT INTO translations (rus_word_id, pers_word_id, definition, confidence)
SELECT rus_id, pers_id, definition, confidence FROM (
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'привет') as rus_id,
    (SELECT id FROM pers_words WHERE word = 'سلام') as pers_id,
    'приветствие при встрече' as definition,
    100 as confidence
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'дом'),
    (SELECT id FROM pers_words WHERE word = 'خانه'),
    'здание для проживания',
    100
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'любовь'),
    (SELECT id FROM pers_words WHERE word = 'عشق'),
    'сильное чувство привязанности',
    100
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'работа'),
    (SELECT id FROM pers_words WHERE word = 'کار'),
    'трудовая деятельность',
    95
  UNION ALL
  SELECT 
    (SELECT id FROM rus_words WHERE word = 'семья'),
    (SELECT id FROM pers_words WHERE word = 'خانواده'),
    'группа близких родственников',
    100
) translations_data;