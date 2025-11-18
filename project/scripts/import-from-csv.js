#!/usr/bin/env node

/**
 * Import words from CSV file
 *
 * CSV Format:
 *   rus_word,rus_phonetic,rus_pos,pers_word,pers_phonetic,pers_pos,definition,confidence,rus_example,pers_example
 *
 * Example CSV:
 *   школа,ˈʂkolə,существительное,مدرسه,mædˈrese,существительное,учебное заведение,100,Дети идут в школу,بچه‌ها به مدرسه می‌روند
 *
 * Usage:
 *   node scripts/import-from-csv.js words.csv
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importFromCSV(filename) {
  try {
    console.log(`📖 Reading CSV file: ${filename}\n`);

    const fileContent = readFileSync(filename, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} word pairs to import\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const [index, record] of records.entries()) {
      console.log(`\n[${index + 1}/${records.length}] Processing: ${record.rus_word} ↔ ${record.pers_word}`);

      try {
        // Insert Russian word
        let { data: rusWord, error: rusError } = await supabase
          .from('rus_words')
          .insert({
            word: record.rus_word,
            phonetic: record.rus_phonetic || null,
            part_of_speech: record.rus_pos || 'существительное',
            frequency: record.rus_frequency || 'частое',
            difficulty: record.rus_difficulty || 'начальный'
          })
          .select()
          .single();

        if (rusError && rusError.code === '23505') {
          const { data } = await supabase
            .from('rus_words')
            .select('id')
            .eq('word', record.rus_word)
            .single();
          rusWord = data;
          console.log(`  ⚠️  Russian word exists, using existing`);
        } else if (rusError) {
          throw rusError;
        } else {
          console.log(`  ✅ Russian word added`);
        }

        // Insert Persian word
        let { data: persWord, error: persError } = await supabase
          .from('pers_words')
          .insert({
            word: record.pers_word,
            phonetic: record.pers_phonetic || null,
            part_of_speech: record.pers_pos || 'существительное',
            frequency: record.pers_frequency || 'частое',
            difficulty: record.pers_difficulty || 'начальный'
          })
          .select()
          .single();

        if (persError && persError.code === '23505') {
          const { data } = await supabase
            .from('pers_words')
            .select('id')
            .eq('word', record.pers_word)
            .single();
          persWord = data;
          console.log(`  ⚠️  Persian word exists, using existing`);
        } else if (persError) {
          throw persError;
        } else {
          console.log(`  ✅ Persian word added`);
        }

        // Link translation
        const { error: transError } = await supabase
          .from('translations')
          .insert({
            rus_word_id: rusWord.id,
            pers_word_id: persWord.id,
            definition: record.definition || '',
            confidence: parseInt(record.confidence) || 100
          });

        if (transError && transError.code !== '23505') {
          throw transError;
        } else if (!transError) {
          console.log(`  ✅ Translation linked`);
        }

        // Add Russian example if provided
        if (record.rus_example && record.rus_example_trans) {
          await supabase
            .from('rus_examples')
            .insert({
              word_id: rusWord.id,
              example_text: record.rus_example,
              translation: record.rus_example_trans
            });
          console.log(`  ✅ Russian example added`);
        }

        // Add Persian example if provided
        if (record.pers_example && record.pers_example_trans) {
          await supabase
            .from('pers_examples')
            .insert({
              word_id: persWord.id,
              example_text: record.pers_example,
              translation: record.pers_example_trans
            });
          console.log(`  ✅ Persian example added`);
        }

        successCount++;
        console.log(`  🎉 Success!`);

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✨ Import completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors:  ${errorCount}`);
    console.log(`${'='.repeat(50)}\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Get filename from command line arguments
const filename = process.argv[2];

if (!filename) {
  console.error('❌ Usage: node import-from-csv.js <filename.csv>');
  process.exit(1);
}

importFromCSV(filename);
