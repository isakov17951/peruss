/*
  # Создание схемы базы данных для русско-персидского словаря

  ## Описание
  Создание структуры базы данных для двуязычного словаря с отдельными таблицами
  для русских и персидских слов, включая связи между переводами.

  ## Новые таблицы
  1. **rus_words** - русские слова с полной информацией
     - `id` (uuid, первичный ключ)
     - `word` (text, русское слово)
     - `phonetic` (text, фонетическая транскрипция)
     - `part_of_speech` (text, часть речи)
     - `frequency` (text, частота использования)
     - `difficulty` (text, уровень сложности)
     - `etymology` (text, этимология)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

  2. **pers_words** - персидские слова с полной информацией
     - `id` (uuid, первичный ключ)
     - `word` (text, персидское слово)
     - `phonetic` (text, фонетическая транскрипция)
     - `part_of_speech` (text, часть речи)
     - `frequency` (text, частота использования)
     - `difficulty` (text, уровень сложности)
     - `etymology` (text, этимология)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

  3. **rus_examples** - примеры использования русских слов
     - `id` (uuid, первичный ключ)
     - `word_id` (uuid, внешний ключ на rus_words)
     - `example_text` (text, пример предложения)
     - `translation` (text, перевод примера)

  4. **pers_examples** - примеры использования персидских слов
     - `id` (uuid, первичный ключ)
     - `word_id` (uuid, внешний ключ на pers_words)
     - `example_text` (text, пример предложения)
     - `translation` (text, перевод примера)

  5. **translations** - связи между русскими и персидскими словами
     - `id` (uuid, первичный ключ)
     - `rus_word_id` (uuid, внешний ключ на rus_words)
     - `pers_word_id` (uuid, внешний ключ на pers_words)
     - `definition` (text, определение/перевод)
     - `confidence` (integer, уверенность в переводе 1-100)

  ## Безопасность
  - Включена RLS для всех таблиц
  - Политики для чтения данных всеми пользователями
  - Политики для записи только аутентифицированными пользователями
*/

-- Создание таблицы русских слов
CREATE TABLE IF NOT EXISTS rus_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  phonetic text,
  part_of_speech text NOT NULL,
  frequency text DEFAULT 'частое' CHECK (frequency IN ('частое', 'редкое', 'очень редкое')),
  difficulty text DEFAULT 'начальный' CHECK (difficulty IN ('начальный', 'средний', 'продвинутый')),
  etymology text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы персидских слов
CREATE TABLE IF NOT EXISTS pers_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  phonetic text,
  part_of_speech text NOT NULL,
  frequency text DEFAULT 'частое' CHECK (frequency IN ('частое', 'редкое', 'очень редкое')),
  difficulty text DEFAULT 'начальный' CHECK (difficulty IN ('начальный', 'средний', 'продвинутый')),
  etymology text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы примеров для русских слов
CREATE TABLE IF NOT EXISTS rus_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES rus_words(id) ON DELETE CASCADE,
  example_text text NOT NULL,
  translation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы примеров для персидских слов
CREATE TABLE IF NOT EXISTS pers_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES pers_words(id) ON DELETE CASCADE,
  example_text text NOT NULL,
  translation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы переводов (связи между русскими и персидскими словами)
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rus_word_id uuid NOT NULL REFERENCES rus_words(id) ON DELETE CASCADE,
  pers_word_id uuid NOT NULL REFERENCES pers_words(id) ON DELETE CASCADE,
  definition text NOT NULL,
  confidence integer DEFAULT 100 CHECK (confidence >= 1 AND confidence <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(rus_word_id, pers_word_id)
);

-- Создание индексов для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_rus_words_word ON rus_words(word);
CREATE INDEX IF NOT EXISTS idx_rus_words_part_of_speech ON rus_words(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_rus_words_frequency ON rus_words(frequency);
CREATE INDEX IF NOT EXISTS idx_rus_words_difficulty ON rus_words(difficulty);

CREATE INDEX IF NOT EXISTS idx_pers_words_word ON pers_words(word);
CREATE INDEX IF NOT EXISTS idx_pers_words_part_of_speech ON pers_words(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_pers_words_frequency ON pers_words(frequency);
CREATE INDEX IF NOT EXISTS idx_pers_words_difficulty ON pers_words(difficulty);

CREATE INDEX IF NOT EXISTS idx_rus_examples_word_id ON rus_examples(word_id);
CREATE INDEX IF NOT EXISTS idx_pers_examples_word_id ON pers_examples(word_id);

CREATE INDEX IF NOT EXISTS idx_translations_rus_word_id ON translations(rus_word_id);
CREATE INDEX IF NOT EXISTS idx_translations_pers_word_id ON translations(pers_word_id);

-- Создание полнотекстового поиска для русских слов
CREATE INDEX IF NOT EXISTS idx_rus_words_search ON rus_words USING gin(to_tsvector('russian', word || ' ' || COALESCE(phonetic, '')));

-- Создание полнотекстового поиска для персидских слов
CREATE INDEX IF NOT EXISTS idx_pers_words_search ON pers_words USING gin(to_tsvector('simple', word || ' ' || COALESCE(phonetic, '')));

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_rus_words_updated_at 
  BEFORE UPDATE ON rus_words 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pers_words_updated_at 
  BEFORE UPDATE ON pers_words 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security
ALTER TABLE rus_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE pers_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE rus_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE pers_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для чтения (доступно всем)
CREATE POLICY "Allow public read access to rus_words"
  ON rus_words
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to pers_words"
  ON pers_words
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to rus_examples"
  ON rus_examples
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to pers_examples"
  ON pers_examples
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to translations"
  ON translations
  FOR SELECT
  TO public
  USING (true);

-- Политики безопасности для записи (только аутентифицированные пользователи)
CREATE POLICY "Allow authenticated users to insert rus_words"
  ON rus_words
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update rus_words"
  ON rus_words
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert pers_words"
  ON pers_words
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update pers_words"
  ON pers_words
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert rus_examples"
  ON rus_examples
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert pers_examples"
  ON pers_examples
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert translations"
  ON translations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update translations"
  ON translations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);