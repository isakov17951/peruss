/*
  # Create translations table and related structures

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `rus_word_id` (uuid, foreign key to rus_words)
      - `pers_word_id` (uuid, foreign key to pers_words)
      - `definition` (text, translation definition)
      - `confidence` (integer, translation confidence 1-100)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `translations` table
    - Add policies for public read access
    - Add policies for authenticated users to insert/update

  3. Indexes
    - Index on rus_word_id for fast lookups
    - Index on pers_word_id for fast lookups
    - Unique constraint on (rus_word_id, pers_word_id) pair

  4. Constraints
    - Confidence must be between 1 and 100
    - Foreign key constraints with CASCADE delete
</sql>

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rus_word_id uuid NOT NULL,
  pers_word_id uuid NOT NULL,
  definition text NOT NULL,
  confidence integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT translations_confidence_check CHECK (confidence >= 1 AND confidence <= 100),
  CONSTRAINT translations_rus_word_id_pers_word_id_key UNIQUE (rus_word_id, pers_word_id)
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Add foreign key to rus_words if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'translations_rus_word_id_fkey'
  ) THEN
    ALTER TABLE translations 
    ADD CONSTRAINT translations_rus_word_id_fkey 
    FOREIGN KEY (rus_word_id) REFERENCES rus_words(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to pers_words if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'translations_pers_word_id_fkey'
  ) THEN
    ALTER TABLE translations 
    ADD CONSTRAINT translations_pers_word_id_fkey 
    FOREIGN KEY (pers_word_id) REFERENCES pers_words(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_rus_word_id ON translations(rus_word_id);
CREATE INDEX IF NOT EXISTS idx_translations_pers_word_id ON translations(pers_word_id);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to translations"
  ON translations
  FOR SELECT
  TO public
  USING (true);

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