# Dictionary Word Management Scripts

Scripts for adding and managing words in the Russian-Persian dictionary.

## Prerequisites

1. **Environment Setup**
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your Supabase credentials:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # This will install: @supabase/supabase-js, dotenv, csv-parse
   ```

## Methods for Adding Words

### Method 1: Quick Command Line (Fastest for Single Words)

Use `quick-add.js` for adding a single word pair from the command line.

**Usage:**
```bash
node scripts/quick-add.js <rus_word> <pers_word> <definition> [part_of_speech]

# Example:
node scripts/quick-add.js "солнце" "خورشید" "небесное светило" "существительное"

# With optional phonetics:
node scripts/quick-add.js "солнце" "خورشید" "небесное светило" "существительное" \
  --rus-phonetic "ˈsontsə" \
  --pers-phonetic "xoršid" \
  --difficulty "начальный" \
  --confidence 100
```

**Optional flags:**
- `--rus-phonetic <value>` - Russian phonetic transcription
- `--pers-phonetic <value>` - Persian phonetic transcription
- `--frequency <value>` - частое/редкое/очень редкое
- `--difficulty <value>` - начальный/средний/продвинутый
- `--confidence <value>` - Translation confidence 1-100

**Features:**
- Add word pairs in seconds
- No file editing required
- Interactive error messages
- Automatic duplicate handling

---

### Method 2: SQL Script (For Direct Database Access)

Use `add-words-simple.sql` for direct SQL insertion via Supabase dashboard.

**Steps:**
1. Open your Supabase project → SQL Editor
2. Copy the template from `add-words-simple.sql`
3. Replace `RUSSIAN_WORD` and `PERSIAN_WORD` with your words
4. Fill in other fields (phonetic, part of speech, etc.)
5. Click "Run"

**Example included:** Adding "учитель" (teacher) / "معلم"

---

### Method 3: Node.js Script (For Multiple Words)

Use `add-words.js` for programmatic insertion with better error handling.

**Usage:**
```bash
# Edit the wordsToAdd array in add-words.js
node scripts/add-words.js

# Or using npm:
npm run add-words
```

**Features:**
- Automatic duplicate detection
- Batch processing
- Detailed logging
- Transaction-like behavior

**Example in script:**
```javascript
const wordsToAdd = [
  {
    russian: {
      word: 'школа',
      phonetic: 'ˈʂkolə',
      partOfSpeech: 'существительное',
      examples: [
        { text: 'Дети идут в школу', translation: 'بچه‌ها به مدرسه می‌روند' }
      ]
    },
    persian: {
      word: 'مدرسه',
      phonetic: 'mædˈrese',
      partOfSpeech: 'существительное'
    },
    translation: {
      definition: 'учебное заведение',
      confidence: 100
    }
  }
];
```

---

### Method 4: CSV Import (For Bulk Data)

Use `import-from-csv.js` for importing from spreadsheets.

**Usage:**
```bash
node scripts/import-from-csv.js example-words.csv

# Or using npm:
npm run import-csv example-words.csv
```

**CSV Format:**
```csv
rus_word,rus_phonetic,rus_pos,pers_word,pers_phonetic,pers_pos,definition,confidence
школа,ˈʂkolə,существительное,مدرسه,mædˈrese,существительное,учебное заведение,100
```

**See:** `example-words.csv` for a complete example with 3 word pairs.

---

## Database Schema Reference

### Tables

1. **rus_words** - Russian words
   - `word` (required) - Russian word
   - `phonetic` (optional) - IPA pronunciation
   - `part_of_speech` (required) - существительное, глагол, прилагательное, наречие, etc.
   - `frequency` (optional) - частое, редкое, очень редкое (default: частое)
   - `difficulty` (optional) - начальный, средний, продвинутый (default: начальный)
   - `etymology` (optional) - Word origin

2. **pers_words** - Persian words
   - Same structure as `rus_words`

3. **translations** - Links between Russian and Persian words
   - `rus_word_id` - Foreign key to rus_words
   - `pers_word_id` - Foreign key to pers_words
   - `definition` - Translation definition/explanation
   - `confidence` - Confidence score 1-100 (default: 100)

4. **rus_examples** - Russian usage examples
   - `word_id` - Foreign key to rus_words
   - `example_text` - Example sentence in Russian
   - `translation` - Persian translation

5. **pers_examples** - Persian usage examples
   - `word_id` - Foreign key to pers_words
   - `example_text` - Example sentence in Persian
   - `translation` - Russian translation

### Part of Speech Values

- `существительное` - Noun
- `глагол` - Verb
- `прилагательное` - Adjective
- `наречие` - Adverb
- `предлог` - Preposition
- `союз` - Conjunction
- `междометие` - Interjection
- `местоимение` - Pronoun

## Security Notes

⚠️ **Row Level Security (RLS) is enabled:**
- Public users can **read** all words
- Only **authenticated users** can **insert/update** words

To add words via scripts, you need:
1. Supabase service role key (for admin access), OR
2. Authenticated user session

Current scripts use the anon key, which requires RLS policies to allow insertion. You may need to temporarily adjust policies or use a service role key for bulk imports.

## Troubleshooting

### "Missing Supabase credentials"
- Ensure `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### "Permission denied" or "RLS policy violation"
- Check that your Supabase RLS policies allow insertion
- Consider using service role key for admin operations
- Temporarily disable RLS for bulk imports (not recommended for production)

### "Duplicate key error"
- Word already exists in database
- Scripts handle this gracefully and use existing word

### CSV import fails
- Check CSV format matches the header exactly
- Ensure no special characters break the CSV structure
- Use UTF-8 encoding for Persian/Russian text

## Examples

See the migration file for complete examples:
```
/home/user/peruss/project/supabase/migrations/20250805225434_summer_sea.sql
```

This contains 10 pre-populated word pairs with examples.
