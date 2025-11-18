#!/usr/bin/env node

/**
 * Script to add words to the Russian-Persian dictionary
 *
 * Usage:
 *   node scripts/add-words.js
 *
 * Before running:
 *   1. Install dependencies: npm install @supabase/supabase-js dotenv
 *   2. Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Add a word pair (Russian ↔ Persian) with examples
 */
async function addWordPair({
  russian,
  persian,
  translation
}) {
  try {
    console.log(`\n📝 Adding word pair: ${russian.word} ↔ ${persian.word}`);

    // 1. Insert Russian word
    const { data: rusWord, error: rusError } = await supabase
      .from('rus_words')
      .insert({
        word: russian.word,
        phonetic: russian.phonetic || null,
        part_of_speech: russian.partOfSpeech,
        frequency: russian.frequency || 'частое',
        difficulty: russian.difficulty || 'начальный',
        etymology: russian.etymology || null
      })
      .select()
      .single();

    if (rusError) {
      if (rusError.code === '23505') { // Duplicate
        console.log(`⚠️  Russian word "${russian.word}" already exists`);
        const { data } = await supabase
          .from('rus_words')
          .select('id')
          .eq('word', russian.word)
          .single();
        rusWord = data;
      } else {
        throw rusError;
      }
    } else {
      console.log(`✅ Russian word added: ${russian.word}`);
    }

    // 2. Insert Persian word
    const { data: persWord, error: persError } = await supabase
      .from('pers_words')
      .insert({
        word: persian.word,
        phonetic: persian.phonetic || null,
        part_of_speech: persian.partOfSpeech,
        frequency: persian.frequency || 'частое',
        difficulty: persian.difficulty || 'начальный',
        etymology: persian.etymology || null
      })
      .select()
      .single();

    if (persError) {
      if (persError.code === '23505') { // Duplicate
        console.log(`⚠️  Persian word "${persian.word}" already exists`);
        const { data } = await supabase
          .from('pers_words')
          .select('id')
          .eq('word', persian.word)
          .single();
        persWord = data;
      } else {
        throw persError;
      }
    } else {
      console.log(`✅ Persian word added: ${persian.word}`);
    }

    // 3. Link translation
    const { error: transError } = await supabase
      .from('translations')
      .insert({
        rus_word_id: rusWord.id,
        pers_word_id: persWord.id,
        definition: translation.definition,
        confidence: translation.confidence || 100
      });

    if (transError && transError.code !== '23505') {
      throw transError;
    } else if (!transError) {
      console.log(`✅ Translation link created`);
    }

    // 4. Add Russian examples
    if (russian.examples && russian.examples.length > 0) {
      for (const example of russian.examples) {
        const { error: exError } = await supabase
          .from('rus_examples')
          .insert({
            word_id: rusWord.id,
            example_text: example.text,
            translation: example.translation
          });

        if (!exError) {
          console.log(`✅ Russian example added`);
        }
      }
    }

    // 5. Add Persian examples
    if (persian.examples && persian.examples.length > 0) {
      for (const example of persian.examples) {
        const { error: exError } = await supabase
          .from('pers_examples')
          .insert({
            word_id: persWord.id,
            example_text: example.text,
            translation: example.translation
          });

        if (!exError) {
          console.log(`✅ Persian example added`);
        }
      }
    }

    console.log(`🎉 Successfully added word pair!`);
    return { success: true, rusWord, persWord };

  } catch (error) {
    console.error(`❌ Error adding word pair:`, error.message);
    return { success: false, error };
  }
}

// ==========================================
// EXAMPLE USAGE - Add your words here
// ==========================================

const wordsToAdd = [
  {
    russian: {
      word: 'школа',
      phonetic: 'ˈʂkolə',
      partOfSpeech: 'существительное',
      frequency: 'частое',
      difficulty: 'начальный',
      etymology: 'От латинского schola',
      examples: [
        { text: 'Дети идут в школу', translation: 'بچه‌ها به مدرسه می‌روند' },
        { text: 'Моя школа очень большая', translation: 'مدرسه من خیلی بزرگ است' }
      ]
    },
    persian: {
      word: 'مدرسه',
      phonetic: 'mædˈrese',
      partOfSpeech: 'существительное',
      frequency: 'частое',
      difficulty: 'начальный',
      etymology: 'Из арабского مدرسة',
      examples: [
        { text: 'مدرسه نزدیک خانه است', translation: 'Школа находится рядом с домом' },
        { text: 'در مدرسه درس می‌خوانیم', translation: 'В школе мы учимся' }
      ]
    },
    translation: {
      definition: 'учебное заведение для получения общего образования',
      confidence: 100
    }
  },
  // Add more word pairs here...
];

// Run the script
async function main() {
  console.log('🚀 Starting word import...\n');

  for (const wordPair of wordsToAdd) {
    await addWordPair(wordPair);
  }

  console.log('\n✨ Import complete!');
}

main();
